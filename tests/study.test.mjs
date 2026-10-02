import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { studyCollections, getStudyCollection } from '../src/data/studyCollections/index.ts';
import { validateStudyCollections } from '../src/lib/studyValidation.ts';
import { studyKey, parseStudyPosition, saveStudyPosition, loadStudyPosition, studyPageLabel, isStudyPosition } from '../src/lib/study.ts';
import { questionSourceLabel } from '../src/lib/sources.ts';
const collection = studyCollections[0];

test('navigation labels use optional summaries and otherwise keep source titles', () => {
  const page=collection.pages[0];
  assert.equal(studyPageLabel({...page,tocLabel:'物種與淡水'}),'物種與淡水');
  assert.equal(studyPageLabel({...page,tocLabel:undefined}),page.title);
  const order=collection.pages.map(page=>page.id);
  collection.pages.map(studyPageLabel);
  assert.deepEqual(collection.pages.map(page=>page.id),order);
  assert.equal(collection.pages[0].title,'環保題整理【1】');
  assert.equal(collection.pages[2].tocLabel,'環境法規、清潔生產、BOD與水污染');
  assert.equal(collection.pages[39].tocLabel,undefined);
});
test('study jumps accept only integer positions within this collection', () => {
  assert.equal(isStudyPosition(collection,0),true);
  assert.equal(isStudyPosition(collection,collection.pages.length-1),true);
  for(const position of [-1,collection.pages.length,0.5,NaN,Infinity,'1',null,undefined])
    assert.equal(isStudyPosition(collection,position),false);
});
test('jumped reading position persists using the existing v1 schema without invalid overwrites', () => {
  const values=new Map();
  globalThis.window={localStorage:{getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)}};
  try {
    const destination=collection.pages.length-1;
    assert.equal(saveStudyPosition(collection,destination),true);
    assert.deepEqual(JSON.parse(values.get(studyKey(collection))),{version:1,position:destination});
    assert.equal(loadStudyPosition(collection),destination);
    for(const position of [-1,collection.pages.length,0.5,NaN]) assert.equal(saveStudyPosition(collection,position),false);
    assert.equal(loadStudyPosition(collection),destination);
  } finally { delete globalThis.window; }
});
test('study navigation summaries are optional but must be nonempty strings', () => {
  const copy=structuredClone(collection);
  for(const page of copy.pages) delete page.tocLabel;
  assert.deepEqual(validateStudyCollections([copy],()=>true),[]);
  for(const label of ['', '   ', null, 123]) {
    copy.pages[0].tocLabel=label;
    assert.ok(validateStudyCollections([copy],()=>true).some(error=>error.includes('複習目錄名稱無效')));
  }
  copy.pages[0].tocLabel='物種與淡水';
  assert.deepEqual(validateStudyCollections([copy],()=>true),[]);
});

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
