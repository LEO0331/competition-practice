import type { QuestionSet } from "../../types/question.ts";
import { guanlan113Taipei } from "./113-taipei-guanlan.ts";
import { taipei113Supplement } from "./113-taipei-jintounao-supplement.ts";

export const taipei113Combined: QuestionSet = {
  ...guanlan113Taipei,
  title: "113 年－臺北市灌籃高手與金頭腦",
  subtitle: "含 24 題灌籃高手精簡試題與 20 題金頭腦補充試題",
  questions: [
    ...guanlan113Taipei.questions,
    ...taipei113Supplement.questions.map((question, index) => ({
      ...question, number: guanlan113Taipei.questions.length + index + 1,
    })),
  ],
  progressSources: [guanlan113Taipei, taipei113Supplement].map((set) => ({
    id: set.id, questionIds: set.questions.map((question) => question.id),
  })),
};
