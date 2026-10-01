import type { StudyCollection } from "../types/study.ts";

export function studyKey(collection: StudyCollection): string {
  return `competition-practice:notes:v1:${collection.id}`;
}
export function parseStudyPosition(collection: StudyCollection, raw: string | null): number {
  try {
    const value = JSON.parse(raw ?? "null");
    return value?.version === 1 && Number.isInteger(value.position) && value.position >= 0 && value.position < collection.pages.length
      ? value.position : 0;
  } catch { return 0; }
}
export function loadStudyPosition(collection: StudyCollection): number {
  try { return parseStudyPosition(collection, window.localStorage.getItem(studyKey(collection))); }
  catch { return 0; }
}
export function saveStudyPosition(collection: StudyCollection, position: number): boolean {
  if (!Number.isInteger(position) || position < 0 || position >= collection.pages.length) return false;
  try { window.localStorage.setItem(studyKey(collection), JSON.stringify({ version: 1, position })); return true; }
  catch { return false; }
}
