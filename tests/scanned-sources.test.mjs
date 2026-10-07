import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { questionSets, getQuestionSet } from '../src/data/questionSets/index.ts';
import { getStudyCollection } from '../src/data/studyCollections/index.ts';

const sources = JSON.parse(readFileSync(new URL('../sources/scanned-practice/manifest.json', import.meta.url), 'utf8'));

test('all six supplied scanned PDFs remain byte-for-byte preserved', () => {
  assert.equal(sources.length, 6);
  assert.equal(new Set(sources.map(source => source.folder)).size, 4);
  assert.equal(sources.reduce((total, source) => total + source.pages, 0), 36);
  for (const source of sources) {
    const bytes = readFileSync(new URL(`../${source.path}`, import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256, source.file);
  }
});

test('distinct scanned papers keep their complete row counts and original numbering gaps', () => {
  for (const [id, count] of [
    ['113-taipei-guanlan', 44],
    ['113-taipei-jintounao', 45], ['113-national-jintounao-scanned', 65],
    ['113-city-supplied', 45], ['113-environment-knowledge', 22], ['114-national-jintounao', 60],
  ]) {
    const set = getQuestionSet(id);
    assert.equal(set.questions.length, count, id);
    assert.deepEqual(set.questions.map(q => q.number), Array.from({ length: count }, (_, i) => i + 1), id);
  }
  const supplement = getQuestionSet('113-taipei-jintounao-supplement');
  assert.ok(!supplement.questions.some(q => q.source.questionLabel === '北市金頭腦補充試題 第3題'));
  const aq = getQuestionSet('113-taipei-jintounao').questions.find(q => q.source.questionLabel === '1');
  assert.equal(aq.answer, 2);
  assert.ok(aq.source.note.includes('手寫'));
  const knowledge = getQuestionSet('113-environment-knowledge').questions;
  assert.deepEqual(knowledge.map(q => q.answer), [3,4,2,2,2,3,2,3,3,1,1,3,1,4,2,1,4,4,4,3,1,1]);
  assert.equal(knowledge.filter(q => q.explanation !== null).length, 20);
});

test('user-authorized reconstruction completes the summary and removes the separate check collection', () => {
  const reconstructed = [53, 68, 169, 176, 179, 181, 184, 185, 191];
  const set = getQuestionSet('112-summary');
  assert.equal(set.questions.length, 200);
  assert.deepEqual(set.questions.map(q => q.number),
    Array.from({ length: 200 }, (_, i) => i + 1));
  for (const number of reconstructed) {
    const q = set.questions.find(question => question.number === number);
    assert.match(q.source.note, /依題意推測補全/);
  }
  assert.equal(getStudyCollection('112-summary-notes'), undefined);
});

test('every scanned source page is accounted for by registered questions with upright source images', () => {
  for (const source of sources) {
    const questions = questionSets.flatMap(set => set.questions).filter(q => q.source.file === source.file);
    assert.ok(questions.length, source.file);
    assert.deepEqual([...new Set(questions.map(q => q.source.page))].sort((a, b) => a - b),
      Array.from({ length: source.pages }, (_, i) => i + 1), source.file);
    for (const question of questions) {
      assert.ok(question.source.images?.length, question.id);
      assert.equal(question.choices.length, 4, question.id);
      assert.ok([1, 2, 3, 4].includes(question.answer), question.id);
    }
  }
});
