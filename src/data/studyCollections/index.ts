import { environmentNotes } from "./environment.ts";
import type { StudyCollection } from "../../types/study.ts";
export const studyCollections: StudyCollection[] = [environmentNotes];
export function getStudyCollection(id: string): StudyCollection | undefined {
  return studyCollections.find((collection) => collection.id === id);
}
