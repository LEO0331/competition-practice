import type { StudyCollection, StudyPage } from "../types/study.ts";

export function studyPageLabel(page: StudyPage): string {
  return page.tocLabel ?? page.title;
}
export function isStudyPosition(collection: StudyCollection, position: unknown): position is number {
  return typeof position === "number" && Number.isInteger(position) && position >= 0 && position < collection.pages.length;
}

export function studyKey(collection: StudyCollection): string {
  return `competition-practice:notes:v1:${collection.id}`;
}
export function parseStudyPosition(collection: StudyCollection, raw: string | null): number {
  try {
    const value = JSON.parse(raw ?? "null");
    return value?.version === 1 && isStudyPosition(collection, value.position)
      ? value.position : 0;
  } catch { return 0; }
}
export function loadStudyPosition(collection: StudyCollection): number {
  try { return parseStudyPosition(collection, window.localStorage.getItem(studyKey(collection))); }
  catch { return 0; }
}
export function saveStudyPosition(collection: StudyCollection, position: number): boolean {
  if (!isStudyPosition(collection, position)) return false;
  try { window.localStorage.setItem(studyKey(collection), JSON.stringify({ version: 1, position })); return true; }
  catch { return false; }
}
