import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { questionSets, getQuestionSet } from '../src/data/questionSets/index.ts';
import { validateQuestionSets } from '../src/lib/validation.ts';
import { orderedQuestions } from '../src/lib/questions.ts';

test('all registered datasets and actual image assets validate', () => {
  assert.deepEqual(validateQuestionSets(questionSets, (path) => existsSync(new URL(`../public${path}`, import.meta.url))), []);
});
test('first set has precisely 60 source rows and deterministic IDs', () => {
  const set = getQuestionSet('114-jintounao');
  assert.equal(set.questions.length, 60);
  assert.deepEqual(orderedQuestions(set).map(q => q.number), Array.from({length:60}, (_,i)=>i+1));
  for (const q of set.questions) assert.equal(q.id, `114-jintounao-q${String(q.number).padStart(3,'0')}`);
});
test('lookup returns registered set or undefined', () => {
  assert.equal(getQuestionSet('114-jintounao'), questionSets[0]);
  assert.equal(getQuestionSet('missing'), undefined);
});
test('ordering does not mutate source', () => {
  const set = structuredClone(questionSets[0]);
  set.questions.reverse();
  const first = set.questions[0];
  assert.equal(orderedQuestions(set)[0].number, 1);
  assert.equal(set.questions[0], first);
});
test('validation rejects corrupted data, answers, images and provenance', () => {
  const set = structuredClone(questionSets[0]);
  const q = set.questions[0];
  set.questions[1].id = q.id;
  q.number = 0; q.answer = 5; q.text = ''; q.choices = [{id:1,text:''}]; q.source.page = 0;
  q.image = '/question-assets/missing.png'; q.imageAlt = '';
  const errors = validateQuestionSets([set], () => false);
  for (const fragment of ['識別碼', '題號', '答案', '選項', '來源', '圖片', '替代文字', '60'])
    assert.ok(errors.some(e => e.includes(fragment)), fragment);
});
test('validation accepts a new independent image-only set', () => {
  const set = structuredClone(questionSets[0]);
  set.id = 'future'; set.questions = [set.questions[0]];
  set.questions[0].text = ''; set.questions[0].image = '/question-assets/future/q.png'; set.questions[0].imageAlt = '原始題目圖片';
  assert.deepEqual(validateQuestionSets([set], () => true), []);
});
