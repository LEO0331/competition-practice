import test from 'node:test';
import assert from 'node:assert/strict';
import { clearReviewSession, loadReviewSession, reviewKey } from '../src/lib/review.ts';

const question = id => ({id,number:1,text:id,choices:[1,2,3,4].map(id=>({id,text:String(id)})),answer:1,source:{file:'test.pdf'}});
const mapping = {'scan-first':'first','scan-second':'second','scan-warmup':'warmup'};
const makeSet = (questionIdMap = mapping) => ({id:'official',title:'Official',sourceFile:'test.pdf',questions:['warmup','first','second'].map(question),
  progressSources:[{id:'scan',questionIds:['scan-first','scan-second','scan-warmup'],questionIdMap}]});
const key = id => `competition-practice:review:v1:${id}`;
const snapshot = (questionIds,position,answers={},completed=false) => JSON.stringify({version:1,questionIds,progress:{version:1,position,answers,completed}});
function withStorage(entries, run) {
  const values = new Map(entries), writes = [];
  globalThis.window = {localStorage:{getItem:key=>values.get(key)??null,setItem:(key,value)=>{writes.push(key);values.set(key,value);},removeItem:key=>values.delete(key)}};
  try { run(values,writes); } finally { delete globalThis.window; }
}

test('scanned review maps answers and current question into canonical subset source order', () => {
  const set = makeSet();
  const scanned = snapshot(['scan-first','scan-warmup'],0,{'scan-first':2});
  withStorage([[key('scan'),scanned],['competition-practice:v1:official','full-result']], (values,writes) => {
    const restored = loadReviewSession(set);
    assert.deepEqual(restored,{version:1,questionIds:['warmup','first'],progress:{version:1,position:1,answers:{first:2},completed:false}});
    assert.equal(values.get(key('scan')),scanned);
    assert.equal(values.get('competition-practice:v1:official'),'full-result');
    assert.deepEqual(writes,[key('official')]);
    values.set(key('scan'),snapshot(['scan-second'],0,{'scan-second':4}));
    assert.deepEqual(loadReviewSession(set),restored);
    assert.deepEqual(writes,[key('official')]);
  });
});

test('completed scanned review preserves completion and maps the warmup current question', () => {
  withStorage([[key('scan'),snapshot(['scan-first','scan-warmup'],1,{'scan-first':3,'scan-warmup':4},true)]], () => {
    assert.deepEqual(loadReviewSession(makeSet()),{version:1,questionIds:['warmup','first'],progress:{version:1,position:0,answers:{first:3,warmup:4},completed:true}});
  });
});

test('canonical review, deliberate null, and malformed canonical storage all take precedence', () => {
  const set = makeSet(), canonical = snapshot(['second'],0,{second:2});
  for (const raw of [canonical,'null','broken']) {
    withStorage([[key('official'),raw],[key('scan'),snapshot(['scan-first'],0,{'scan-first':3})]], (values,writes) => {
      assert.deepEqual(loadReviewSession(set),raw===canonical?JSON.parse(canonical):null);
      assert.equal(values.get(key('official')),raw);
      assert.deepEqual(writes,[]);
    });
  }
});

test('explicit mapped review clear saves a tombstone that prevents legacy resurrection', () => {
  const set = makeSet();
  withStorage([[key('scan'),snapshot(['scan-first'],0,{'scan-first':3})]], (values,writes) => {
    assert.ok(loadReviewSession(set));
    clearReviewSession(set);
    assert.equal(values.get(reviewKey(set)),'null');
    assert.equal(loadReviewSession(set),null);
    assert.equal(loadReviewSession(set),null);
    assert.ok(writes.every(key=>key.startsWith('competition-practice:review:')));
  });
  const ordinary = {...set,progressSources:undefined};
  withStorage([[key('official'),snapshot(['first'],0)]], values => {
    clearReviewSession(ordinary);
    assert.equal(values.has(key('official')),false);
  });
});

test('malformed mapping or legacy review cannot migrate unknown and duplicate IDs', () => {
  for (const invalid of [null,[],{}, {...mapping,'scan-first':'missing'},{...mapping,'scan-second':'first'}]) {
    withStorage([[key('scan'),snapshot(['scan-first'],0)]], (values,writes) => {
      assert.equal(loadReviewSession(makeSet(invalid)),null);
      assert.equal(values.has(key('official')),false);
      assert.deepEqual(writes,[]);
    });
  }
  for (const raw of ['broken',snapshot(['unknown'],0),snapshot(['scan-first','scan-first'],0),snapshot(['scan-first'],5),snapshot(['scan-first'],0,[])]) {
    withStorage([[key('scan'),raw]], (values,writes) => {
      assert.equal(loadReviewSession(makeSet()),null);
      assert.equal(values.has(key('official')),false);
      assert.deepEqual(writes,[]);
    });
  }
});

test('blocked reads and writes fail safely without affecting full progress', () => {
  const set = makeSet();
  globalThis.window = {get localStorage(){throw new Error('blocked');}};
  try { assert.equal(loadReviewSession(set),null); clearReviewSession(set); } finally { delete globalThis.window; }
  const scanned = snapshot(['scan-first'],0,{'scan-first':2});
  globalThis.window = {localStorage:{getItem:key=>key.endsWith(':scan')?scanned:null,setItem:()=>{throw new Error('read only');}}};
  try {
    assert.deepEqual(loadReviewSession(set),{version:1,questionIds:['first'],progress:{version:1,position:0,answers:{first:2},completed:false}});
    clearReviewSession(set);
  } finally { delete globalThis.window; }
});
