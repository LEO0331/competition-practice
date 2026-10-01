import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { imageSources } from '../src/data/imageSources.ts';
import { questionSets, getQuestionSet } from '../src/data/questionSets/index.ts';
import { studyCollections } from '../src/data/studyCollections/index.ts';
import { validateQuestionSets } from '../src/lib/validation.ts';

test('every supplied image is preserved byte-for-byte and referenced by its material', () => {
  assert.equal(imageSources.length,79);
  assert.equal(new Set(imageSources.map(s=>s.file)).size,79);
  const questions=new Map(questionSets.flatMap(set=>set.questions.map(q=>[q.id,q])));
  const pages=new Map(studyCollections.flatMap(collection=>collection.pages.map(p=>[p.id,p])));
  for (const source of imageSources) {
    const bytes=readFileSync(new URL(`../public${source.image}`,import.meta.url));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),source.sha256,source.file);
    assert.ok(source.questionIds.length || source.studyPageId,source.file);
    for (const id of source.questionIds) {
      assert.equal(questions.get(id)?.source.file,source.file);
      assert.ok(questions.get(id)?.source.images.includes(source.image));
    }
    if (source.studyPageId) assert.equal(pages.get(source.studyPageId)?.image,source.image);
  }
});
test('new source sets contain 28 and 58 explicit-answer questions in filename order', () => {
  for (const [id,count] of [['112-taipei-jintounao',28],['112-national-jintounao',58]]) {
    const set=getQuestionSet(id);
    assert.equal(set.questions.length,count);
    assert.deepEqual(set.questions.map(q=>q.number),Array.from({length:count},(_,i)=>i+1));
    const files=set.questions.map(q=>q.source.file);
    assert.deepEqual(files,[...files].sort());
    assert.ok(set.questions.every(q=>q.source.kind==='image' && q.source.page===undefined && q.explanation===null));
  }
});
test('missing national source numbers remain missing and source answer concern is retained', () => {
  const labels=getQuestionSet('112-national-jintounao').questions.map(q=>q.source.questionLabel);
  assert.ok(!labels.includes('第4-3題') && !labels.includes('第4-4題'));
  const flagged=getQuestionSet('112-taipei-jintounao').questions.find(q=>q.source.file==='IMG_9609.JPG' && q.source.note);
  assert.equal(flagged.source.file,'IMG_9609.JPG'); assert.equal(flagged.answer,4);
  assert.ok(flagged.choices[3].text.includes('？'));
});
test('review-only images never become guessed multiple-choice questions', () => {
  const reviewOnly=imageSources.filter(s=>s.kind==='review');
  assert.equal(reviewOnly.length,48);
  for (const source of reviewOnly) assert.equal(source.questionIds.length,0);
});
test('image provenance permits absent page numbers but still validates optional numbers', () => {
  const set=structuredClone(getQuestionSet('112-taipei-jintounao'));
  assert.deepEqual(validateQuestionSets([set],()=>true),[]);
  set.questions[0].source.page=0;
  assert.ok(validateQuestionSets([set],()=>true).some(e=>e.includes('來源')));
});
