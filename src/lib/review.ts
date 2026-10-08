import type { QuestionSet } from "../types/question.ts";
import { createProgress, parseProgress, type Progress } from "./progress.ts";

export type ReviewSession = { version: 1; questionIds: string[]; progress: Progress };

export function reviewKey(set: Pick<QuestionSet, "id">): string {
  return `competition-practice:review:v1:${set.id}`;
}
export function incorrectQuestionIds(set: QuestionSet, progress: Progress): string[] {
  return set.questions
    .filter((q) => progress.answers[q.id] !== undefined && progress.answers[q.id] !== q.answer)
    .map((q) => q.id);
}
export function reviewQuestionSet(set: QuestionSet, questionIds: string[]): QuestionSet {
  const ids = new Set(questionIds);
  return { ...set, questions: set.questions.filter((q) => ids.has(q.id)) };
}
export function createReviewSession(set: QuestionSet, progress: Progress): ReviewSession | null {
  const questionIds = incorrectQuestionIds(set, progress);
  if (!progress.completed || !questionIds.length) return null;
  return { version: 1, questionIds, progress: createProgress(set) };
}
export function parseReviewSession(set: QuestionSet, raw: string | null): ReviewSession | null {
  try {
    const value = JSON.parse(raw ?? "null");
    if (!value || value.version !== 1 || !Array.isArray(value.questionIds) ||
        !value.questionIds.length || value.questionIds.some((id: unknown) => typeof id !== "string") ||
        new Set(value.questionIds).size !== value.questionIds.length) return null;
    const subset = reviewQuestionSet(set, value.questionIds);
    if (subset.questions.length !== value.questionIds.length) return null;
    const progress = value.progress;
    if (!progress || progress.version !== 1 || !Number.isInteger(progress.position) ||
        progress.position < 0 || progress.position >= subset.questions.length ||
        !progress.answers || typeof progress.answers !== "object" || Array.isArray(progress.answers)) return null;
    return {
      version: 1,
      questionIds: subset.questions.map((q) => q.id),
      // Review always follows source order, independently of the full session.
      progress: parseProgress(subset, JSON.stringify({ ...progress, questionOrder: undefined })),
    };
  } catch { return null; }
}
export function loadReviewSession(set: QuestionSet): ReviewSession | null {
  try {
    const raw = window.localStorage.getItem(reviewKey(set));
    // Existing review state, including an explicit clear, owns this session.
    if (raw !== null) return parseReviewSession(set, raw);
    const questions = new Map(set.questions.map((question) => [question.id, question]));
    for (const source of set.progressSources ?? []) {
      const mapping = source.questionIdMap;
      if (source.id === set.id || !mapping || typeof mapping !== "object" || Array.isArray(mapping)) continue;
      const mappedIds = source.questionIds.map((id) => Object.hasOwn(mapping, id) ? mapping[id] : undefined);
      if (!source.questionIds.length || new Set(source.questionIds).size !== source.questionIds.length ||
          new Set(mappedIds).size !== mappedIds.length ||
          mappedIds.some((id) => typeof id !== "string" || !questions.has(id))) continue;
      const sourceSet: QuestionSet = { ...set, id: source.id,
        questions: source.questionIds.map((id, index) => ({ ...questions.get(mappedIds[index]!)!, id })) };
      const legacy = parseReviewSession(sourceSet, window.localStorage.getItem(reviewKey(sourceSet)));
      if (!legacy) continue;
      const subset = reviewQuestionSet(set, legacy.questionIds.map((id) => mapping[id]));
      const currentId = mapping[legacy.questionIds[legacy.progress.position]];
      const migrated: ReviewSession = { version: 1,
        questionIds: subset.questions.map((question) => question.id),
        progress: { ...legacy.progress,
          position: subset.questions.findIndex((question) => question.id === currentId),
          answers: Object.fromEntries(Object.entries(legacy.progress.answers).map(([id, answer]) => [mapping[id], answer])),
        },
      };
      saveReviewSession(set, migrated);
      return migrated;
    }
    return null;
  }
  catch { return null; }
}
export function saveReviewSession(set: QuestionSet, session: ReviewSession): boolean {
  try { window.localStorage.setItem(reviewKey(set), JSON.stringify(session)); return true; }
  catch { return false; }
}
export function clearReviewSession(set: Pick<QuestionSet, "id" | "progressSources">): void {
  try {
    if (set.progressSources?.some((source) => source.questionIdMap !== undefined)) {
      window.localStorage.setItem(reviewKey(set), "null");
    } else window.localStorage.removeItem(reviewKey(set));
  }
  catch { /* Full-session reset still works when review storage is unavailable. */ }
}
