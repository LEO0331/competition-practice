import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { questionSets, getQuestionSet } from '../src/data/questionSets/index.ts';

test('115 guanlan retains 30 main rows and five PK rows with the printed answer key', () => {
  const set = getQuestionSet('115-guanlan');
  assert.equal(questionSets[0], set);
  assert.equal(set.questions.length, 35);
  assert.deepEqual(set.questions.map(q => q.answer), [3,2,2,3,3,2,2,1,4,1,2,4,3,1,3,3,3,3,2,1,1,4,3,2,4,1,2,2,1,1,1,3,3,3,3]);
  assert.deepEqual(set.questions.map(q => q.number), Array.from({length:35}, (_,i) => i+1));
  assert.deepEqual(set.questions.slice(30).map(q => q.source.questionLabel), ['PK-1','PK-2','PK-3','PK-4','PK-5']);
  for (const q of set.questions) {
    assert.equal(q.source.file, set.sourceFile);
    assert.equal(q.source.page, q.number <= 18 ? 1 : 2);
    assert.equal(q.explanation, null);
    assert.equal(q.source.images.length, 1);
  }
  assert.equal(set.questions[11].image, '/question-assets/115-guanlan/water-label.png');
  assert.equal(set.questions[25].choices[1].text, '苯駢芘');
});

test('the new scan is preserved with its own checksum inventory', () => {
  const [source] = JSON.parse(readFileSync(new URL('../sources/scanned-practice/115灌籃高手/manifest.json', import.meta.url), 'utf8'));
  const bytes = readFileSync(new URL(`../${source.path}`, import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), source.sha256);
  assert.equal(source.pages, 2);
  assert.equal(source.file, getQuestionSet('115-guanlan').sourceFile);
});
