import type { StudyCollection } from "../types/study.ts";

export function validateStudyCollections(collections: StudyCollection[], assetExists: (path: string) => boolean): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const pages = new Set<string>();
  for (const collection of collections) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(collection.id) || ids.has(collection.id)) errors.push("複習資料識別碼無效或重複");
    ids.add(collection.id);
    if (!collection.title.trim() || !collection.pages.length) errors.push(`${collection.id}：缺少名稱或內容`);
    for (const page of collection.pages) {
      if (!page.id.trim() || pages.has(page.id)) errors.push(`${collection.id}：頁面識別碼無效或重複`);
      pages.add(page.id);
      if (!page.title.trim() || !page.imageAlt.trim() || !page.source.file.trim()) errors.push(`${page.id}：缺少名稱、替代文字或來源`);
      if (!/^\/source-images\/environment\/img_\d+\.jpg$/.test(page.image) || !assetExists(page.image)) errors.push(`${page.id}：原始圖片不存在`);
      if (page.source.page !== undefined && (!Number.isInteger(page.source.page) || page.source.page <= 0)) errors.push(`${page.id}：來源頁碼無效`);
      if (!page.sections.length || page.sections.some((section) => !section.text.trim())) errors.push(`${page.id}：缺少轉錄文字`);
    }
  }
  return errors;
}
