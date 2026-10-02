import test from 'node:test';
import assert from 'node:assert/strict';
import { getQuestionSet } from '../src/data/questionSets/index.ts';

test('both additional PDFs register complete sequential question sets and actual page provenance', () => {
  for (const [id,count,file,pages] of [
    ['113-national-jintounao',65,'113年群英會全國賽_環保金頭腦題目V2.pdf_8753.pdf',4],
    ['114-guanlan',30,'114年群英會-灌籃高手題目.pdf_3148.pdf',3],
  ]) {
    const set=getQuestionSet(id);
    assert.equal(set.sourceFile,file);
    assert.equal(set.questions.length,count);
    assert.deepEqual(set.questions.map(q=>q.number),Array.from({length:count},(_,i)=>i+1));
    for (const q of set.questions) {
      assert.equal(q.id,`${id}-q${String(q.number).padStart(3,'0')}`);
      assert.equal(q.source.file,file);
      assert.ok(Number.isInteger(q.source.page) && q.source.page>=1 && q.source.page<=pages);
    }
  }
});
test('113 warmup and main labels stay distinct with all 60 main source labels', () => {
  const questions=getQuestionSet('113-national-jintounao').questions;
  assert.deepEqual(questions.slice(0,5).map(q=>q.source.questionLabel),Array.from({length:5},(_,i)=>`暖身賽第${i+1}題`));
  const labels=Array.from({length:60},(_,i)=>`第${Math.floor(i/4)+1}-${i%4+1}題`);
  assert.deepEqual(questions.slice(5).map(q=>q.source.questionLabel),labels);
  assert.deepEqual([1,2,3,4].map(page=>questions.filter(q=>q.source.page===page).length),[17,20,20,8]);
  assert.ok(questions.every(q=>q.explanation===null));
});
test('114 guanlan keeps original explanations including the borderless Q11 cell', () => {
  const questions=getQuestionSet('114-guanlan').questions;
  assert.equal(questions.filter(q=>q.explanation!==null).length,15);
  assert.equal(questions[0].answer,3);
  assert.equal(questions[0].explanation,'臺北市淨零排放管理自治條例');
  assert.equal(questions[10].answer,2);
  assert.equal(questions[10].explanation,'石灰岩經造山運動變質成大理岩，可用來製造水泥。臺灣東部盛產大理岩');
  assert.ok(questions[9].explanation.includes('於埋後'));
});
