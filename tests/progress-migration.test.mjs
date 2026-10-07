import test from 'node:test';
import assert from 'node:assert/strict';
import { createProgress, loadProgress, saveProgress, progressKey, parseProgress, sessionQuestions } from '../src/lib/progress.ts';

const question = id => ({ id, number: 1, text: id, choices: [1,2,3,4].map(id => ({id,text:String(id)})), answer: 1, source: {file:'test.pdf'} });
const makeSet = (ids, sources) => ({ id:'main', title:'Test', sourceFile:'test.pdf', questions:ids.map(question), progressSources:sources });
const snapshot = (position, answers = {}, extra = {}) => JSON.stringify({version:1,position,answers,completed:false,...extra});
function withStorage(entries, run) {
  const values = new Map(entries);
  globalThis.window = {localStorage:{getItem:key=>values.get(key)??null,setItem:(key,value)=>values.set(key,value)}};
  try { run(values); } finally { delete globalThis.window; }
}
const key = id => `competition-practice:v1:${id}`;

test('inserted questions preserve the sequential current question and old answers', () => {
  const set = makeSet(['a','new','b','c'], [{id:'main',questionIds:['a','b','c']}]);
  withStorage([[key('main'), snapshot(1,{a:2})]], values => {
    const restored = loadProgress(set);
    assert.equal(restored.position,2);
    assert.equal(sessionQuestions(set,restored)[restored.position].id,'b');
    assert.deepEqual(restored.answers,{a:2});
    assert.deepEqual(JSON.parse(values.get(key('main'))).questionIds,['a','new','b','c']);
    assert.deepEqual(loadProgress(set),restored);
  });
});

test('old random order remains a prefix and resumes the same question', () => {
  const set = makeSet(['a','new','b','c'], [{id:'main',questionIds:['a','b','c']}]);
  withStorage([[key('main'),snapshot(1,{c:1},{questionOrder:['c','a','b']})]], () => {
    const restored = loadProgress(set);
    assert.deepEqual(restored.questionOrder,['c','a','b','new']);
    assert.equal(restored.position,1);
    assert.equal(sessionQuestions(set,restored)[1].id,'a');
  });
});

test('combined papers merge both answer maps and preserve the supplemental legacy record', () => {
  const set = makeSet(['a','b','c','d'], [{id:'main',questionIds:['a','b']},{id:'supplement',questionIds:['c','d']}]);
  const main = snapshot(1,{a:1}), supplemental = snapshot(1,{c:3});
  withStorage([[key('main'),main],[key('supplement'),supplemental]], values => {
    const restored = loadProgress(set);
    assert.deepEqual(restored.answers,{a:1,c:3});
    assert.equal(restored.position,1);
    assert.equal(values.get(key('supplement')),supplemental);
    assert.deepEqual(loadProgress(set),restored);
  });
});

test('supplemental progress alone resumes its current question in the combined paper', () => {
  const set = makeSet(['a','b','c','d'], [{id:'main',questionIds:['a','b']},{id:'supplement',questionIds:['c','d']}]);
  withStorage([[key('supplement'),snapshot(1,{c:3})]], () => {
    assert.equal(loadProgress(set).position,3);
    assert.deepEqual(loadProgress(set).answers,{c:3});
  });
});

test('a previously completed paper becomes unfinished when questions are added', () => {
  const set = makeSet(['a','new','b'], [{id:'main',questionIds:['a','b']}]);
  withStorage([[key('main'),snapshot(1,{a:1,b:2},{completed:true})]], () => {
    const restored = loadProgress(set);
    assert.equal(restored.completed,false);
    assert.equal(restored.position,1);
    assert.deepEqual(restored.answers,{a:1,b:2});
  });
});

test('a completed random paper resumes its first appended unanswered question', () => {
  const set = makeSet(['a','new','b'], [{id:'main',questionIds:['a','b']}]);
  withStorage([[key('main'),snapshot(1,{a:1,b:2},{completed:true,questionOrder:['b','a']})]], () => {
    const restored = loadProgress(set);
    assert.equal(restored.completed,false);
    assert.deepEqual(restored.questionOrder,['b','a','new']);
    assert.equal(restored.position,2);
  });
});

test('completed main paper resumes supplemental questions unless both papers are complete', () => {
  const set = makeSet(['a','b','c','d'], [{id:'main',questionIds:['a','b']},{id:'supplement',questionIds:['c','d']}]);
  const main = snapshot(1,{a:1,b:2},{completed:true});
  withStorage([[key('main'),main]], () => {
    const restored = loadProgress(set);
    assert.equal(restored.position,2);
    assert.equal(restored.completed,false);
  });
  withStorage([[key('main'),main],[key('supplement'),snapshot(1,{c:3,d:4},{completed:true})]], () => {
    const restored = loadProgress(set);
    assert.equal(restored.completed,true);
    assert.equal(restored.position,1);
    assert.deepEqual(restored.answers,{a:1,b:2,c:3,d:4});
  });
});

test('migration handles inaccessible storage and can resume when writes are blocked', () => {
  const set = makeSet(['a','new','b'], [{id:'main',questionIds:['a','b']}]);
  globalThis.window = {get localStorage(){ throw new Error('blocked'); }};
  try {
    assert.deepEqual(loadProgress(set),createProgress(set));
    assert.equal(saveProgress(set,createProgress(set)),false);
  } finally { delete globalThis.window; }
  globalThis.window = {localStorage:{getItem:()=>snapshot(1,{a:1}),setItem:()=>{throw new Error('read only');}}};
  try {
    const restored = loadProgress(set);
    assert.equal(restored.position,2);
    assert.deepEqual(restored.answers,{a:1});
    assert.deepEqual(loadProgress(set),restored);
  } finally { delete globalThis.window; }
});

test('an explicit fresh restart wins over supplemental answers on every reload', () => {
  const set = makeSet(['a','b'], [{id:'main',questionIds:['a']},{id:'supplement',questionIds:['b']}]);
  withStorage([[key('main'),snapshot(0,{a:1})],[key('supplement'),snapshot(0,{b:2})]], () => {
    assert.equal(Object.keys(loadProgress(set).answers).length,2);
    const fresh = createProgress(set);
    saveProgress(set,fresh);
    assert.deepEqual(loadProgress(set),fresh);
    assert.deepEqual(loadProgress(set),fresh);
  });
});

test('malformed orders and unrelated storage are not broadened into valid progress', () => {
  const set = makeSet(['a','new','b'], [{id:'main',questionIds:['a','b']}]);
  for (const raw of ['broken',snapshot(1,{a:1},{questionOrder:['a','other']}),snapshot(9,{a:1}),snapshot(1,[])]) {
    withStorage([[key('main'),raw]], () => assert.deepEqual(loadProgress(set),createProgress(set)));
  }
  const ordinary = makeSet(['a','new','b']);
  assert.deepEqual(parseProgress(ordinary,snapshot(1,{a:1},{questionOrder:['a','b']})),createProgress(ordinary));
});

test('invalid source answers are discarded and current full random progress takes precedence', () => {
  const set = makeSet(['a','b'], [{id:'main',questionIds:['a']},{id:'supplement',questionIds:['b']}]);
  withStorage([[key('main'),snapshot(0,{a:9,unknown:1})]], () => assert.deepEqual(loadProgress(set).answers,{}));
  const current = snapshot(1,{a:2},{questionOrder:['b','a']});
  withStorage([[progressKey(set),current],[key('supplement'),snapshot(0,{b:3})]], () => {
    assert.deepEqual(loadProgress(set),JSON.parse(current));
  });
});
