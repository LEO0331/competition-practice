import { jintounao } from "./114-jintounao.ts";
import type { QuestionSet } from "../../types/question.ts";

export const questionSets: QuestionSet[] = [jintounao];
export function getQuestionSet(id: string): QuestionSet | undefined {
  return questionSets.find((set) => set.id === id);
}
