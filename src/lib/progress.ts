import type { ChoiceId, QuestionSet } from "../types/question.ts";

export type Progress = {
  version: 1;
  position: number;
  answers: Record<string, ChoiceId>;
  completed: boolean;
};
export function progressKey(set: QuestionSet): string {
  return `competition-practice:v1:${set.id}`;
}
export function createProgress(_set: QuestionSet): Progress {
  void _set;
  return { version: 1, position: 0, answers: {}, completed: false };
}
export function parseProgress(set: QuestionSet, raw: string | null): Progress {
  const empty = createProgress(set);
  try {
    const value = JSON.parse(raw ?? "null");
    if (!value || value.version !== 1 || !Number.isInteger(value.position) ||
        value.position < 0 || value.position >= set.questions.length ||
        !value.answers || typeof value.answers !== "object" || Array.isArray(value.answers)) return empty;
    const answers: Record<string, ChoiceId> = {};
    for (const q of set.questions) {
      const choice = value.answers[q.id];
      if ([1, 2, 3, 4].includes(choice)) answers[q.id] = choice;
    }
    return { version: 1, position: value.position, answers,
      completed: value.completed === true && Object.keys(answers).length === set.questions.length };
  } catch { return empty; }
}
export function loadProgress(set: QuestionSet): Progress {
  try { return parseProgress(set, window.localStorage.getItem(progressKey(set))); }
  catch { return createProgress(set); }
}
export function saveProgress(set: QuestionSet, progress: Progress): boolean {
  try { window.localStorage.setItem(progressKey(set), JSON.stringify(progress)); return true; }
  catch { return false; }
}
export function answerQuestion(set: QuestionSet, progress: Progress, choice: ChoiceId): Progress {
  const question = set.questions[progress.position];
  if (!question || progress.answers[question.id] || ![1, 2, 3, 4].includes(choice)) return progress;
  return { ...progress, answers: { ...progress.answers, [question.id]: choice } };
}
export function moveToQuestion(set: QuestionSet, progress: Progress, index: number): Progress {
  if (!Number.isInteger(index) || index < 0 || index > set.questions.length) return progress;
  if (index === set.questions.length) {
    return Object.keys(progress.answers).length === set.questions.length
      ? { ...progress, completed: true } : progress;
  }
  return { ...progress, position: index, completed: false };
}
export function countCorrect(set: QuestionSet, progress: Progress): number {
  return set.questions.filter((q) => progress.answers[q.id] === q.answer).length;
}
export function countAnswered(set: QuestionSet, progress: Progress): number {
  return set.questions.filter((q) => progress.answers[q.id] !== undefined).length;
}
