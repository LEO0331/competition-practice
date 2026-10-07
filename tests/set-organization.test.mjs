import test from 'node:test';
import assert from 'node:assert/strict';
import { questionSets, getQuestionSet, questionSetAliases } from '../src/data/questionSets/index.ts';
import { summary112 } from '../src/data/questionSets/112-summary.ts';
import { guanlan113Taipei } from '../src/data/questionSets/113-taipei-guanlan.ts';
import { taipei113Supplement } from '../src/data/questionSets/113-taipei-jintounao-supplement.ts';

test('all displayed set names use ROC years and descend from newest to oldest', () => {
  assert.equal(questionSets.length, 11);
  const years = questionSets.map(set => Number(set.year));
  assert.deepEqual(years, [...years].sort((a, b) => b - a));
  for (const set of questionSets) {
    assert.ok(set.title.startsWith(`${set.year} 年－`), set.title);
    assert.ok(!/20\d{2}/.test(`${set.title} ${set.subtitle || ''}`), set.title);
  }
});

test('combined Taipei paper retains every old question ID, source and answer', () => {
  const combined = getQuestionSet('113-taipei-guanlan');
  const sources = [guanlan113Taipei, taipei113Supplement];
  assert.equal(combined.questions.length, 44);
  assert.deepEqual(combined.questions.map(q => q.id), sources.flatMap(set => set.questions.map(q => q.id)));
  for (const q of sources.flatMap(set => set.questions)) {
    const updated = combined.questions.find(question => question.id === q.id);
    assert.deepEqual({ ...updated, number: q.number }, q);
  }
  assert.equal(questionSets.some(set => set.id === taipei113Supplement.id), false);
  assert.equal(questionSetAliases[taipei113Supplement.id], combined.id);
  assert.equal(getQuestionSet(taipei113Supplement.id), combined);
});

test('the 200-question summary retains every previously answerable row unchanged', () => {
  const set = getQuestionSet('112-summary');
  for (const q of summary112.questions) assert.deepEqual(set.questions.find(question => question.id === q.id), q);
  assert.deepEqual(set.progressSources, [{ id: summary112.id, questionIds: summary112.questions.map(q => q.id) }]);
});
