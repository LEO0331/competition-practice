import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { questionSets } from '../src/data/questionSets/index.ts';
import { validateQuestionSets } from '../src/lib/validation.ts';

const errors = validateQuestionSets(questionSets, (path) => existsSync(fileURLToPath(new URL(`../public${path}`, import.meta.url))));
if (errors.length) {
  console.error(errors.join('\n'));
  process.exitCode = 1;
} else {
  for (const set of questionSets) console.log(`${set.title}：${set.questions.length} 題，驗證通過`);
}
