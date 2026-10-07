import { jintounao } from "./114-jintounao.ts";
import { taipei112 } from "./112-taipei-jintounao.ts";
import { national112 } from "./112-national-jintounao.ts";
import { national113 } from "./113-national-jintounao.ts";
import { guanlan114 } from "./114-guanlan.ts";
import { jintounao113Taipei } from "./113-taipei-jintounao.ts";
import { national113Scanned } from "./113-national-jintounao-scanned.ts";
import { citySupplied113 } from "./113-city-supplied.ts";
import { environmentKnowledge113Scanned } from "./113-environment-knowledge.ts";
import { national114 } from "./114-national-jintounao.ts";
import { guanlan113Taipei } from "./113-taipei-guanlan.ts";
import { taipei113Supplement } from "./113-taipei-jintounao-supplement.ts";
import { summary112 } from "./112-summary.ts";
import type { QuestionSet } from "../../types/question.ts";

export const questionSets: QuestionSet[] = [jintounao, taipei112, national112, national113, guanlan114,
  summary112, guanlan113Taipei, taipei113Supplement, jintounao113Taipei, national113Scanned,
  citySupplied113, environmentKnowledge113Scanned, national114];
export function getQuestionSet(id: string): QuestionSet | undefined {
  return questionSets.find((set) => set.id === id);
}
