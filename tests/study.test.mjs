import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { studyCollections, getStudyCollection } from '../src/data/studyCollections/index.ts';
import { validateStudyCollections } from '../src/lib/studyValidation.ts';
import { studyKey, parseStudyPosition, saveStudyPosition, loadStudyPosition } from '../src/lib/study.ts';
import { questionSourceLabel } from '../src/lib/sources.ts';
const collection = studyCollections[0];

test('review collections have readable text, source metadata and actual images', () => {
  assert.deepEqual(validateStudyCollections(studyCollections,path=>existsSync(new URL(`../public${path}`,import.meta.url))),[]);
  assert.equal(getStudyCollection(collection.id),collection);
  assert.equal(getStudyCollection('missing'),undefined);
});
test('reading position parses valid data and safely rejects corrupt/out-of-range data', () => {
  assert.equal(parseStudyPosition(collection,JSON.stringify({version:1,position:1})),1);
  for (const raw of [null,'broken','{}',JSON.stringify({version:2,position:1}),JSON.stringify({version:1,position:-1}),JSON.stringify({version:1,position:collection.pages.length})])
    assert.equal(parseStudyPosition(collection,raw),0);
});
test('reading storage is independent of full and wrong-question attempts', () => {
  const values=new Map([['competition-practice:v1:114-jintounao','original-result']]);
  globalThis.window={localStorage:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)}};
  try {
    assert.equal(studyKey(collection),'competition-practice:notes:v1:environment-notes');
    assert.equal(saveStudyPosition(collection,1),true);
    assert.equal(loadStudyPosition(collection),1);
    assert.equal(values.get('competition-practice:v1:114-jintounao'),'original-result');
    assert.equal(saveStudyPosition(collection,-1),false);
  } finally { delete globalThis.window; }
});
test('blocked reading storage does not prevent reading', () => {
  globalThis.window={get localStorage(){throw Error('blocked');}};
  try { assert.equal(loadStudyPosition(collection),0); assert.equal(saveStudyPosition(collection,1),false); }
  finally { delete globalThis.window; }
});
test('review validation detects missing images, text and duplicate page IDs', () => {
  const bad=structuredClone(collection);
  bad.pages[1].id=bad.pages[0].id; bad.pages[0].sections=[];
  assert.ok(validateStudyCollections([bad],()=>false).length>=3);
});
test('image question provenance does not fabricate PDF page numbers', () => {
  assert.equal(questionSourceLabel({file:'IMG_9603.JPG',kind:'image'}),'來源：IMG_9603.JPG');
  assert.equal(questionSourceLabel({file:'source.pdf',page:2}),'來源：source.pdf，第 2 頁');
});
