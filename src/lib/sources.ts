import type { Question } from "../types/question.ts";

export function questionSourceLabel(source: Question["source"]): string {
  const page = source.page ? `，第 ${source.page} 頁` : "";
  const label = source.questionLabel ? `（原題 ${source.questionLabel}）` : "";
  return `來源：${source.file}${page}${label}`;
}
