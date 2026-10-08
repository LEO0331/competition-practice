import test from 'node:test';
import assert from 'node:assert/strict';
import { questionSets } from '../src/data/questionSets/index.ts';
import { loadProgress, saveProgress, createProgress, createRandomProgress, countAnswered, countCorrect, progressKey } from '../src/lib/progress.ts';

import { questionSetSummary as summary } from '../src/lib/questionSetSummary.ts';
function restore(set, entries) {
  const values = new Map(entries);
  globalThis.window = { localStorage: {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  } };
  try { return { progress: loadProgress(set), entries: [...values] }; }
  finally { delete globalThis.window; }
}

test('compact homepage data restores identical positions, scores and storage for every set', () => {
  for (const set of questionSets) {
    const compact = summary(set);
    for (const complete of [false, true]) {
      for (const random of [false, true]) {
        const answers = Object.fromEntries(set.questions.slice(0, complete ? undefined : 2)
          .map((q, i) => [q.id, i % 2 ? (q.answer % 4) + 1 : q.answer]));
        const progress = { version: 1, position: 1, answers, completed: complete,
          ...(random ? { questionOrder: set.questions.map(q => q.id).reverse() } : {}) };
        const entries = [[progressKey(set), JSON.stringify(progress)]];
        const expected = restore(set, entries);
        const actual = restore(compact, entries);
        assert.deepEqual(actual, expected, set.id);
        assert.equal(countAnswered(compact, actual.progress), countAnswered(set, expected.progress));
        assert.equal(countCorrect(compact, actual.progress), countCorrect(set, expected.progress));
      }
    }
    assert.deepEqual(restore(compact, []), restore(set, []));
    assert.deepEqual(restore(compact, [[progressKey(set), 'broken']]), restore(set, [[progressKey(set), 'broken']]));
  }
});

test('homepage summaries omit question content and reduce serialized question data by at least 80%', () => {
  const summaries = questionSets.map(summary);
  for (const compact of summaries) {
    assert.deepEqual(Object.keys(compact).sort(),
      (compact.progressSources ? ['id', 'title', 'questions', 'progressSources'] : ['id', 'title', 'questions']).sort());
    for (const question of compact.questions) assert.deepEqual(Object.keys(question).sort(), ['answer', 'id']);
  }
  assert.ok(Buffer.byteLength(JSON.stringify(summaries)) < Buffer.byteLength(JSON.stringify(questionSets)) * 0.2);
});

test('compact homepage data preserves legacy migration and confirmed restart markers', () => {
  for (const set of questionSets.filter(set => set.progressSources?.length)) {
    const compact = summary(set);
    const entries = set.progressSources.map(source => [progressKey(source), JSON.stringify({
      version: 1, position: 1, completed: false,
      answers: { [source.questionIds[0]]: 2 }, questionOrder: [...source.questionIds].reverse(),
    })]);
    assert.deepEqual(restore(compact, entries), restore(set, entries));
    for (const random of [false, true]) {
      const values = new Map(entries);
      globalThis.window = { localStorage: {
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
      } };
      try {
        const fresh = random ? createRandomProgress(compact, () => 0.5) : createProgress(compact);
        assert.equal(saveProgress(compact, fresh), true);
        assert.deepEqual(loadProgress(set), fresh);
        assert.deepEqual(loadProgress(compact), fresh);
      } finally { delete globalThis.window; }
    }
  }
});
