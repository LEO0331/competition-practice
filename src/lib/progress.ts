import type { ChoiceId, QuestionSet } from "../types/question.ts";
import { shuffle } from "./shuffle.ts";

export type Progress = {
  version: 1;
  position: number;
  answers: Record<string, ChoiceId>;
  completed: boolean;
  questionOrder?: string[];
};
export function progressKey(set: QuestionSet): string {
  return `competition-practice:v1:${set.id}`;
}
export function createProgress(_set: QuestionSet): Progress {
  void _set;
  return { version: 1, position: 0, answers: {}, completed: false };
}
function validOrder(set: QuestionSet, order: unknown): order is string[] {
  const ids = new Set(set.questions.map((q) => q.id));
  return Array.isArray(order) && order.length === set.questions.length && new Set(order).size === ids.size &&
    order.every((id) => typeof id === "string" && ids.has(id));
}
export function createRandomProgress(set: QuestionSet, random: () => number = Math.random): Progress {
  return { ...createProgress(set), questionOrder: shuffle(set.questions.map((q) => q.id), random) };
}
export function sessionQuestions(set: QuestionSet, progress: Progress) {
  if (!validOrder(set, progress.questionOrder)) return set.questions;
  const questions = new Map(set.questions.map((q) => [q.id, q]));
  return progress.questionOrder.map((id) => questions.get(id)!);
}
function readProgress(set: QuestionSet, raw: string | null): Progress | null {
  try {
    const value = JSON.parse(raw ?? "null");
    if (!value || value.version !== 1 || !Number.isInteger(value.position) ||
        value.position < 0 || value.position >= set.questions.length ||
        !value.answers || typeof value.answers !== "object" || Array.isArray(value.answers)) return null;
    if (value.questionOrder !== undefined && !validOrder(set, value.questionOrder)) return null;
    const answers: Record<string, ChoiceId> = {};
    for (const q of set.questions) {
      const choice = value.answers[q.id];
      if ([1, 2, 3, 4].includes(choice)) answers[q.id] = choice;
    }
    return { version: 1, position: value.position, answers,
      ...(value.questionOrder !== undefined ? { questionOrder: [...value.questionOrder] } : {}),
      completed: value.completed === true && Object.keys(answers).length === set.questions.length };
  } catch { return null; }
}
export function parseProgress(set: QuestionSet, raw: string | null): Progress {
  return readProgress(set, raw) ?? createProgress(set);
}
export function loadProgress(set: QuestionSet): Progress {
  try {
    const raw = window.localStorage.getItem(progressKey(set));
    if (!set.progressSources?.length) return parseProgress(set, raw);
    const current = JSON.parse(raw ?? "null");
    // A saved current-set snapshot, including an explicit restart, takes precedence.
    if (current?.questionIds !== undefined || validOrder(set, current?.questionOrder)) {
      return parseProgress(set, raw);
    }
    const questions = new Map(set.questions.map((question) => [question.id, question]));
    const sources = set.progressSources.flatMap((source) => {
      if (!source.questionIds.length || new Set(source.questionIds).size !== source.questionIds.length ||
          source.questionIds.some((id) => !questions.has(id))) return [];
      const sourceSet: QuestionSet = { ...set, id: source.id,
        questions: source.questionIds.map((id) => questions.get(id)!) };
      const progress = readProgress(sourceSet, source.id === set.id ? raw :
        window.localStorage.getItem(progressKey(sourceSet)));
      return progress ? [{ source, progress }] : [];
    });
    if (!sources.length) return parseProgress(set, raw);
    const primary = sources.find(({ source }) => source.id === set.id) ?? sources[0];
    const answers: Record<string, ChoiceId> = {};
    for (const { progress } of sources) Object.assign(answers, progress.answers);
    Object.assign(answers, primary.progress.answers);
    const currentId = (primary.progress.questionOrder ?? primary.source.questionIds)[primary.progress.position];
    const questionOrder = primary.progress.questionOrder ? [
      ...primary.progress.questionOrder,
      ...set.questions.map((question) => question.id).filter((id) => !primary.progress.questionOrder!.includes(id)),
    ] : undefined;
    const order = questionOrder ?? set.questions.map((question) => question.id);
    const completed = sources.some(({ progress }) => progress.completed) && Object.keys(answers).length === set.questions.length;
    const position = primary.progress.completed && !completed
      ? order.findIndex((id) => answers[id] === undefined) : order.indexOf(currentId);
    const migrated: Progress = { version: 1, position, answers, completed,
      ...(questionOrder ? { questionOrder } : {}) };
    saveProgress(set, migrated);
    return migrated;
  }
  catch { return createProgress(set); }
}
export function saveProgress(set: QuestionSet, progress: Progress): boolean {
  try {
    window.localStorage.setItem(progressKey(set), JSON.stringify({ ...progress,
      ...(set.progressSources?.length ? { questionIds: set.questions.map((question) => question.id) } : {}) }));
    return true;
  }
  catch { return false; }
}
export function answerQuestion(set: QuestionSet, progress: Progress, choice: ChoiceId): Progress {
  const question = sessionQuestions(set, progress)[progress.position];
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
