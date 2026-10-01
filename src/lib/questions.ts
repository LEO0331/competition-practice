import type { QuestionSet } from "../types/question.ts";
export function orderedQuestions(set: QuestionSet) {
  return [...set.questions].sort((a, b) => a.number - b.number);
}
