import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgress, loadProgress, saveProgress, sessionQuestions } from '../src/lib/progress.ts';

const question = id => ({ id, number: 1, text: id, choices: [1,2,3,4].map(id => ({id,text:String(id)})), answer: 1, source: {file:'test.pdf'} });
const canonicalIds = ['warmup','first','second'];
const legacyIds = ['scan-first','scan-second','scan-warmup'];
const mapping = {'scan-first':'first','scan-second':'second','scan-warmup':'warmup'};
const makeSet = (questionIdMap = mapping) => ({id:'official',title:'Official',sourceFile:'test.pdf',questions:canonicalIds.map(question),
  progressSources:[{id:'official',questionIds:canonicalIds},{id:'scan',questionIds:legacyIds,questionIdMap}]});
const key = id => `competition-practice:v1:${id}`;
const snapshot = (position, answers = {}, extra = {}) => JSON.stringify({version:1,position,answers,completed:false,...extra});
function withStorage(entries, run) {
  const values = new Map(entries);
  globalThis.window = {localStorage:{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)}};
  try { run(values); } finally { delete globalThis.window; }
}

test('different source IDs and sequential order resume the same canonical question', () => {
  const set = makeSet();
  const legacy = snapshot(1,{'scan-first':2});
  withStorage([[key('scan'),legacy]], values => {
    const restored = loadProgress(set);
    assert.deepEqual(restored.answers,{first:2});
    assert.equal(restored.position,2);
    assert.equal(sessionQuestions(set,restored)[restored.position].id,'second');
    assert.deepEqual(JSON.parse(values.get(key('official'))).questionIds,canonicalIds);
    assert.equal(values.get(key('scan')),legacy);
    assert.deepEqual(loadProgress(set),restored);
  });
});

test('mapped random order and current question survive migration', () => {
  const set = makeSet();
  withStorage([[key('scan'),snapshot(1,{'scan-second':4},{questionOrder:['scan-second','scan-warmup','scan-first']})]], () => {
    const restored = loadProgress(set);
    assert.deepEqual(restored.questionOrder,['second','warmup','first']);
    assert.equal(restored.position,1);
    assert.deepEqual(restored.answers,{second:4});
    assert.equal(sessionQuestions(set,restored)[restored.position].id,'warmup');
  });
});

test('canonical answers and current position win while scanned answers fill gaps', () => {
  const set = makeSet();
  withStorage([[key('official'),snapshot(1,{first:1})],[key('scan'),snapshot(2,{'scan-first':3,'scan-second':4})]], () => {
    const restored = loadProgress(set);
    assert.deepEqual(restored.answers,{first:1,second:4});
    assert.equal(restored.position,1);
    assert.equal(restored.questionOrder,undefined);
  });
});

test('a fully completed scanned paper retains completion with canonical IDs', () => {
  const set = makeSet();
  withStorage([[key('scan'),snapshot(2,{'scan-first':1,'scan-second':2,'scan-warmup':3},{completed:true})]], () => {
    assert.deepEqual(loadProgress(set),{version:1,position:0,answers:{first:1,second:2,warmup:3},completed:true});
  });
});

test('pre-migration canonical random sessions merge once and keep canonical order', () => {
  const set = makeSet();
  withStorage([[key('official'),snapshot(1,{first:1},{questionOrder:['second','warmup','first']})],
    [key('scan'),snapshot(2,{'scan-first':4,'scan-second':3})]], values => {
    const restored = loadProgress(set);
    assert.deepEqual(restored.questionOrder,['second','warmup','first']);
    assert.deepEqual(restored.answers,{first:1,second:3});
    assert.equal(restored.position,1);
    values.set(key('scan'),snapshot(2,{'scan-warmup':4}));
    assert.deepEqual(loadProgress(set),restored);
    saveProgress(set,createProgress(set));
    assert.deepEqual(loadProgress(set),createProgress(set));
    assert.deepEqual(loadProgress(set),createProgress(set));
  });
});

test('malformed maps and scanned records cannot introduce unrelated IDs', () => {
  for (const badMap of [null,[],{}, {...mapping,'scan-first':'unknown'}, {...mapping,'scan-second':'first'}]) {
    const set = makeSet(badMap);
    withStorage([[key('official'),snapshot(1,{warmup:2})],[key('scan'),snapshot(1,{'scan-first':3})]], () => {
      assert.deepEqual(loadProgress(set).answers,{warmup:2});
      assert.equal(loadProgress(set).position,1);
    });
  }
  for (const raw of ['broken',snapshot(9,{'scan-first':1}),snapshot(1,[],{}),snapshot(1,{}, {questionOrder:['scan-first','scan-second','unknown']})]) {
    withStorage([[key('scan'),raw]], () => assert.deepEqual(loadProgress(makeSet()),createProgress(makeSet())));
  }
});

test('mapped migration handles read-only and inaccessible storage', () => {
  const set = makeSet();
  globalThis.window = {localStorage:{getItem:key=>key.endsWith(':scan')?snapshot(1,{'scan-first':2}):null,setItem:()=>{throw new Error('read only');}}};
  try {
    const restored = loadProgress(set);
    assert.deepEqual(restored.answers,{first:2});
    assert.equal(restored.position,2);
    assert.deepEqual(loadProgress(set),restored);
  } finally { delete globalThis.window; }
  globalThis.window = {get localStorage(){throw new Error('blocked');}};
  try { assert.deepEqual(loadProgress(set),createProgress(set)); } finally { delete globalThis.window; }
});
