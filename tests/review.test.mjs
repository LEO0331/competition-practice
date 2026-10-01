import test from 'node:test';
import assert from 'node:assert/strict';
import { questionSets } from '../src/data/questionSets/index.ts';
import { createProgress, answerQuestion, moveToQuestion, countAnswered, countCorrect, saveProgress, loadProgress } from '../src/lib/progress.ts';
import { incorrectQuestionIds, reviewQuestionSet, createReviewSession, parseReviewSession, reviewKey, loadReviewSession, saveReviewSession } from '../src/lib/review.ts';
const set=questionSets[0];
function completedAttempt(wrongNumbers=[]) {
  const p=createProgress(set);
  for (const q of set.questions) p.answers[q.id]=wrongNumbers.includes(q.number) ? q.answer % 4 + 1 : q.answer;
  return {...p,position:set.questions.length-1,completed:true};
}
test('incorrect questions exclude correct and unanswered choices in source order',()=>{
  const p=completedAttempt([16,1,40]); delete p.answers[set.questions[1].id];
  assert.deepEqual(incorrectQuestionIds(set,p),[1,16,40].map(n=>set.questions[n-1].id));
  assert.deepEqual(reviewQuestionSet(set,[set.questions[39].id,set.questions[0].id]).questions.map(q=>q.number),[1,40]);
});
test('zero wrong answers and incomplete attempts produce no review session',()=>{
  assert.equal(createReviewSession(set,completedAttempt()),null);
  assert.equal(createReviewSession(set,{...completedAttempt([1]),completed:false}),null);
});
test('review starts unlocked and does not mutate the previous completed attempt',()=>{
  const full=completedAttempt([1,16]); const before=structuredClone(full);
  const session=createReviewSession(set,full);
  const subset=reviewQuestionSet(set,session.questionIds);
  session.progress=answerQuestion(subset,session.progress,subset.questions[0].answer);
  assert.equal(countAnswered(subset,session.progress),1);
  assert.equal(countCorrect(subset,session.progress),1);
  assert.equal(session.progress.answers[subset.questions[1].id],undefined);
  assert.deepEqual(full,before);
});
test('review serializes independently, resumes, and completes with subset counts',()=>{
  const session=createReviewSession(set,completedAttempt([1,16]));
  const subset=reviewQuestionSet(set,session.questionIds);
  session.progress=answerQuestion(subset,session.progress,subset.questions[0].answer);
  session.progress=moveToQuestion(subset,session.progress,1);
  assert.deepEqual(parseReviewSession(set,JSON.stringify(session)),session);
  session.progress=answerQuestion(subset,session.progress,subset.questions[1].answer);
  session.progress=moveToQuestion(subset,session.progress,2);
  assert.equal(session.progress.completed,true);
  assert.equal(countCorrect(subset,session.progress),2);
  assert.deepEqual(parseReviewSession(set,JSON.stringify(session)),session);
});
test('corrupt, unknown, duplicate or empty review IDs and invalid positions are rejected',()=>{
  const session=createReviewSession(set,completedAttempt([1]));
  const invalid=[null,'broken',JSON.stringify({...session,version:2}),JSON.stringify({...session,questionIds:[]}),
    JSON.stringify({...session,questionIds:['missing']}),JSON.stringify({...session,questionIds:[1]}),
    JSON.stringify({...session,questionIds:[session.questionIds[0],session.questionIds[0]]}),
    JSON.stringify({...session,progress:{...session.progress,position:1}}),
    JSON.stringify({...session,progress:{...session.progress,answers:[]}})];
  for (const raw of invalid) assert.equal(parseReviewSession(set,raw),null);
});
test('review parsing ignores stale answers and rejects forged completion',()=>{
  const session=createReviewSession(set,completedAttempt([1,16]));
  session.progress.answers={missing:1,[set.questions[0].id]:9,[set.questions[15].id]:2};
  session.progress.completed=true;
  const restored=parseReviewSession(set,JSON.stringify(session));
  assert.deepEqual(restored.progress.answers,{[set.questions[15].id]:2});
  assert.equal(restored.progress.completed,false);
});
test('saving and restarting review never overwrite saved full-session results',()=>{
  const values=new Map();
  globalThis.window={localStorage:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)}};
  try {
    const full=completedAttempt([1,16]); saveProgress(set,full);
    const session=createReviewSession(set,full); saveReviewSession(set,session);
    assert.deepEqual(loadReviewSession(set),session); assert.deepEqual(loadProgress(set),full);
    saveReviewSession(set,createReviewSession(set,full)); assert.deepEqual(loadProgress(set),full);
    assert.equal(reviewKey(set),'competition-practice:review:v1:114-jintounao');
  } finally { delete globalThis.window; }
});
test('blocked review storage fails gracefully',()=>{
  globalThis.window={get localStorage(){throw Error('blocked');}};
  try { assert.equal(loadReviewSession(set),null); assert.equal(saveReviewSession(set,createReviewSession(set,completedAttempt([1]))),false); }
  finally { delete globalThis.window; }
});
