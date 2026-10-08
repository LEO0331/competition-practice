import type { QuestionSet, QuestionSetSummary } from "../types/question.ts";

export function questionSetSummary(set: QuestionSet): QuestionSetSummary {
  return {
    id: set.id,
    title: set.title,
    questions: set.questions.map(({ id, answer }) => ({ id, answer })),
    ...(set.progressSources ? { progressSources: set.progressSources } : {}),
  };
}
