import test from 'node:test';
import assert from 'node:assert/strict';
import { questionSets, getQuestionSet } from '../src/data/questionSets/index.ts';
import { national113 } from '../src/data/questionSets/113-national-jintounao.ts';
import { national113Scanned } from '../src/data/questionSets/113-national-jintounao-scanned.ts';
import { national113ScanIdMap } from '../src/data/questionSets/113-national-retained.ts';
import { loadProgress, progressKey, createProgress, saveProgress, sessionQuestions } from '../src/lib/progress.ts';

test('only the retained official national paper is listed and all 65 archived rows map bijectively', () => {
  const retained = getQuestionSet(national113.id);
  assert.deepEqual(retained.questions, national113.questions);
  assert.equal(questionSets.some(set => set.id === national113Scanned.id), false);
  assert.equal(getQuestionSet(national113Scanned.id), retained);
  assert.equal(Object.keys(national113ScanIdMap).length, 65);
  assert.equal(new Set(Object.values(national113ScanIdMap)).size, 65);
  for (const q of national113Scanned.questions) {
    const canonical = retained.questions.find(question => question.id === national113ScanIdMap[q.id]);
    assert.equal(canonical.answer, q.answer);
  }
});

test('remaining papers have distinct complete question-content fingerprints', () => {
  const normalize = text => (text || '').normalize('NFKC').replace(/臺/g, '台').replace(/[\p{P}\p{Z}\s]/gu, '').toLowerCase();
  const fingerprints = new Map();
  for (const set of questionSets) {
    const fingerprint = set.questions.map(q => JSON.stringify([
      normalize(q.text), ...q.choices.map(choice => normalize(choice.text || choice.alt || choice.image)), q.answer,
    ])).sort().join('\n');
    assert.ok(!fingerprints.has(fingerprint), `${set.id} duplicates ${fingerprints.get(fingerprint)}`);
    fingerprints.set(fingerprint, set.id);
  }
});

test('actual scanned random progress maps to the retained paper and cannot return after reset', () => {
  const retained = getQuestionSet(national113.id);
  const order = national113Scanned.questions.map(q => q.id).reverse();
  const raw = JSON.stringify({ version: 1, position: 2, completed: false, questionOrder: order,
    answers: { [order[0]]: 2, [order[1]]: 3 } });
  const values = new Map([[progressKey(national113Scanned), raw]]);
  globalThis.window = { localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) } };
  try {
    const migrated = loadProgress(retained);
    assert.deepEqual(migrated.questionOrder, order.map(id => national113ScanIdMap[id]));
    assert.equal(sessionQuestions(retained, migrated)[migrated.position].id, national113ScanIdMap[order[2]]);
    assert.deepEqual(migrated.answers, { [national113ScanIdMap[order[0]]]: 2, [national113ScanIdMap[order[1]]]: 3 });
    assert.equal(values.get(progressKey(national113Scanned)), raw);
    assert.deepEqual(loadProgress(retained), migrated);
    const fresh = createProgress(retained);
    saveProgress(retained, fresh);
    assert.deepEqual(loadProgress(retained), fresh);
  } finally { delete globalThis.window; }
});
