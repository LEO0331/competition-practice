import type { QuestionSet } from "../../types/question.ts";
import { national113 } from "./113-national-jintounao.ts";
import { national113Scanned } from "./113-national-jintounao-scanned.ts";

const canonicalByLabel = new Map(national113.questions.map((question) => [
  question.source.questionLabel?.replace(/^暖身賽第(\d+)題$/, "T-$1").replace(/^第(.+)題$/, "$1"),
  question,
]));

export const national113ScanIdMap = Object.fromEntries(national113Scanned.questions.map((question) => {
  const canonical = canonicalByLabel.get(question.source.questionLabel);
  if (!canonical || canonical.answer !== question.answer) throw new Error(`113 全國題本無法對應：${question.source.questionLabel}`);
  return [question.id, canonical.id];
}));

export const national113Retained: QuestionSet = {
  ...national113,
  progressSources: [
    { id: national113.id, questionIds: national113.questions.map((question) => question.id) },
    { id: national113Scanned.id, questionIds: national113Scanned.questions.map((question) => question.id),
      questionIdMap: national113ScanIdMap },
  ],
};
