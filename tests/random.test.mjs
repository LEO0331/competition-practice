import test from 'node:test';
import assert from 'node:assert/strict';
import { shuffle } from '../src/lib/shuffle.ts';
import { questionSets } from '../src/data/questionSets/index.ts';
import { createProgress, createRandomProgress, parseProgress, sessionQuestions, answerQuestion, moveToQuestion, countAnswered, countCorrect, saveProgress, loadProgress } from '../src/lib/progress.ts';
import { createReviewSession, reviewQuestionSet, parseReviewSession, saveReviewSession } from '../src/lib/review.ts';
const set=questionSets[0];

test('Fisher-Yates returns a new array without mutation and covers all three-item permutations',()=>{
  const source=['a','b','c']; const permutations=new Set();
  for(let first=0;first<3;first++) for(let second=0;second<2;second++) {
    const samples=[(first+0.5)/3,(second+0.5)/2];
    const result=shuffle(source,()=>samples.shift());
    assert.notEqual(result,source); assert.deepEqual(source,['a','b','c']);
    permutations.add(result.join(''));
  }
  assert.equal(permutations.size,6);
  assert.deepEqual(shuffle([],()=>0),[]);
  assert.throws(()=>shuffle(source,()=>1),RangeError);
});
test('random order contains every ID once, preserves source content and only draws randomness on creation',()=>{
  const before=JSON.stringify(set); let calls=0;
  const p=createRandomProgress(set,()=>{calls++; return 0;});
  assert.equal(calls,set.questions.length-1);
  assert.deepEqual([...p.questionOrder].sort(),set.questions.map(q=>q.id).sort());
  assert.equal(new Set(p.questionOrder).size,set.questions.length);
  const ordered=sessionQuestions(set,p);
  assert.deepEqual(ordered.map(q=>q.id),p.questionOrder);
  for(const q of ordered) { const original=set.questions.find(item=>item.id===q.id); assert.equal(q,original); assert.equal(q.choices,original.choices); }
  sessionQuestions(set,p); parseProgress(set,JSON.stringify(p));
  assert.equal(calls,set.questions.length-1); assert.equal(JSON.stringify(set),before);
});
test('v1 sequential progress remains unchanged and uses the original array',()=>{
  const p=createProgress(set); assert.deepEqual(parseProgress(set,JSON.stringify(p)),p);
  assert.equal(sessionQuestions(set,p),set.questions); assert.equal(p.questionOrder,undefined);
});
test('random reload retains exact order, answers and position with independent result counts',()=>{
  let p=createRandomProgress(set,()=>0);
  const first=sessionQuestions(set,p)[0];
  p=answerQuestion(set,p,first.answer);
  assert.equal(p.answers[first.id],first.answer);
  assert.equal(answerQuestion(set,p,first.answer%4+1),p);
  p=moveToQuestion(set,p,1);
  assert.deepEqual(parseProgress(set,JSON.stringify(p)),p);
  assert.equal(countAnswered(set,p),1); assert.equal(countCorrect(set,p),1);
});
test('invalid saved orders reset safely rather than remapping answered session positions',()=>{
  const ids=set.questions.map(q=>q.id);
  const invalid=[null,'random',[],ids.slice(1),[...ids.slice(0,-1),'missing'],[...ids.slice(0,-1),ids[0]],ids.map((id,i)=>i===0?1:id)];
  for(const questionOrder of invalid) assert.deepEqual(parseProgress(set,JSON.stringify({...createProgress(set),questionOrder})),createProgress(set));
});
test('random session completes normally and new creation draws a fresh order with clean answers',()=>{
  let p=createRandomProgress(set,()=>0); const order=[...p.questionOrder];
  for(let i=0;i<set.questions.length;i++) { p=moveToQuestion(set,p,i); p=answerQuestion(set,p,sessionQuestions(set,p)[i].answer); }
  p=moveToQuestion(set,p,set.questions.length);
  assert.equal(p.completed,true); assert.equal(countCorrect(set,p),set.questions.length);
  assert.deepEqual(parseProgress(set,JSON.stringify(p)),p);
  const fresh=createRandomProgress(set,()=>0.999);
  assert.notDeepEqual(fresh.questionOrder,order); assert.deepEqual(fresh.answers,{}); assert.equal(fresh.completed,false);
  assert.deepEqual(p.questionOrder,order);
});
test('wrong-answer review is source ordered and never inherits or overwrites random full order',()=>{
  const p={...createRandomProgress(set,()=>0),completed:true,position:set.questions.length-1};
  for(const q of set.questions) p.answers[q.id]=[1,16].includes(q.number)?q.answer%4+1:q.answer;
  const before=structuredClone(p); const review=createReviewSession(set,p);
  const subset=reviewQuestionSet(set,review.questionIds);
  assert.deepEqual(subset.questions.map(q=>q.number),[1,16]); assert.equal(review.progress.questionOrder,undefined);
  const restored=parseReviewSession(set,JSON.stringify({...review,progress:{...review.progress,questionOrder:[...review.questionIds].reverse()}}));
  assert.equal(restored.progress.questionOrder,undefined);
  const values=new Map(); globalThis.window={localStorage:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)}};
  try { saveProgress(set,p); saveReviewSession(set,review); assert.deepEqual(loadProgress(set),before); }
  finally { delete globalThis.window; }
  assert.deepEqual(p,before);
});
