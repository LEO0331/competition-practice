import test from 'node:test';
import assert from 'node:assert/strict';
import { questionSets } from '../src/data/questionSets/index.ts';
import { createProgress, parseProgress, progressKey, answerQuestion, moveToQuestion, countCorrect, loadProgress, saveProgress } from '../src/lib/progress.ts';
const set = questionSets[0];

test('serialized progress resumes position, chosen answers and result', () => {
  let p = answerQuestion(set, createProgress(set), set.questions[0].answer);
  p = moveToQuestion(set, p, 1);
  const restored = parseProgress(set, JSON.stringify(p));
  assert.deepEqual(restored, p); assert.equal(countCorrect(set, restored), 1);
});
test('answer is locked for an attempt and reset starts clean', () => {
  const p = answerQuestion(set, createProgress(set), 1);
  assert.equal(answerQuestion(set, p, 2), p);
  assert.deepEqual(createProgress(set).answers, {});
});
test('malformed, wrong-version and invalid positions fall back safely', () => {
  for (const raw of [null, 'broken', '{}', '{"version":2}', JSON.stringify({...createProgress(set),position:60}), JSON.stringify({...createProgress(set),answers:[]})])
    assert.deepEqual(parseProgress(set,raw),createProgress(set));
});
test('stale question IDs and invalid answers are ignored; forged completion rejected', () => {
  const p = parseProgress(set, JSON.stringify({...createProgress(set),completed:true,answers:{missing:1,[set.questions[0].id]:9,[set.questions[1].id]:2}}));
  assert.deepEqual(p.answers, {[set.questions[1].id]:2}); assert.equal(p.completed,false);
});
test('completion requires all answers, preserves score, and resumes', () => {
  let p = createProgress(set);
  assert.equal(moveToQuestion(set,p,60),p);
  for (let i=0;i<60;i++) { p=moveToQuestion(set,p,i); p=answerQuestion(set,p,set.questions[i].answer); }
  p=moveToQuestion(set,p,60);
  assert.equal(p.completed,true); assert.equal(countCorrect(set,p),60);
  assert.deepEqual(parseProgress(set,JSON.stringify(p)),p);
});
test('previous and out-of-range positions are handled without losing answers', () => {
  const p = answerQuestion(set,createProgress(set),1);
  assert.equal(moveToQuestion(set,p,-1),p);
  assert.equal(moveToQuestion(set,p,61),p);
  assert.deepEqual(moveToQuestion(set,moveToQuestion(set,p,1),0).answers,p.answers);
});
test('storage uses separate versioned keys and handles blocked storage', () => {
  assert.equal(progressKey(set),'competition-practice:v1:114-jintounao');
  assert.notEqual(progressKey(set),progressKey({...set,id:'future'}));
  const values=new Map();
  globalThis.window={localStorage:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)}};
  const p=answerQuestion(set,createProgress(set),1);
  assert.equal(saveProgress(set,p),true); assert.deepEqual(loadProgress(set),p);
  globalThis.window={get localStorage(){throw new Error('blocked');}};
  assert.equal(saveProgress(set,p),false); assert.deepEqual(loadProgress(set),createProgress(set));
  delete globalThis.window;
});
