import { jintounao } from "./114-jintounao.ts";
import { taipei112 } from "./112-taipei-jintounao.ts";
import { national112 } from "./112-national-jintounao.ts";
import { national113 } from "./113-national-jintounao.ts";
import { guanlan114 } from "./114-guanlan.ts";
import type { QuestionSet } from "../../types/question.ts";

export const questionSets: QuestionSet[] = [jintounao, taipei112, national112, national113, guanlan114];
export function getQuestionSet(id: string): QuestionSet | undefined {
  return questionSets.find((set) => set.id === id);
}
