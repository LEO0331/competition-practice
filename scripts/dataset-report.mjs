import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { questionSets } from '../src/data/questionSets/index.ts';
import { validateQuestionSets } from '../src/lib/validation.ts';
import { studyCollections } from '../src/data/studyCollections/index.ts';
import { validateStudyCollections } from '../src/lib/studyValidation.ts';

const assetExists = (path) => existsSync(fileURLToPath(new URL(`../public${path}`, import.meta.url)));
const errors = [...validateQuestionSets(questionSets, assetExists), ...validateStudyCollections(studyCollections, assetExists)];
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  for (const set of questionSets) console.log(`${set.title}：${set.questions.length} 題，驗證通過`);
  for (const collection of studyCollections) console.log(`${collection.title}：${collection.pages.length} 頁，驗證通過`);
}
