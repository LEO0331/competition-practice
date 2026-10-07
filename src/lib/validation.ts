import type { QuestionSet } from "../types/question.ts";

// The caller supplies asset existence checks so this module also stays browser-safe.
export function validateQuestionSets(sets: QuestionSet[], assetExists?: (path: string) => boolean): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const setIds = new Set<string>();
  const nonempty = (text: unknown): text is string => typeof text === "string" && text.trim().length > 0;
  const image = (path: string | undefined, alt: string | undefined, label: string) => {
    if (path === undefined) return;
    if (!/^\/question-assets\/[a-zA-Z0-9/_-]+\.(png|jpg|jpeg|webp|svg)$/.test(path) || (assetExists && !assetExists(path)))
      errors.push(`${label}：圖片路徑無效或檔案不存在`);
    if (!nonempty(alt)) errors.push(`${label}：圖片缺少替代文字`);
  };
  for (const set of sets) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(set.id) || setIds.has(set.id)) errors.push(`${set.id}：題庫識別碼無效或重複`);
    setIds.add(set.id);
    if (!nonempty(set.title) || !nonempty(set.sourceFile)) errors.push(`${set.id}：缺少名稱或來源檔名`);
    if (!set.questions.length) errors.push(`${set.id}：題庫不可為空`);
    const numbers = new Set<number>();
    for (const q of set.questions) {
      const label = `${set.id} 第 ${q.number} 題`;
      if (!nonempty(q.id) || ids.has(q.id)) errors.push(`${label}：題目識別碼空白或重複`);
      ids.add(q.id);
      if (!Number.isInteger(q.number) || q.number <= 0 || numbers.has(q.number)) errors.push(`${label}：題號無效或重複`);
      numbers.add(q.number);
      if (!nonempty(q.text) && !nonempty(q.image)) errors.push(`${label}：缺少題目內容`);
      image(q.image, q.imageAlt, label);
      if (q.choices.length !== 4 || q.choices.map((c) => c.id).sort().join(",") !== "1,2,3,4") errors.push(`${label}：須有選項一至四各一個`);
      for (const c of q.choices) {
        if (!nonempty(c.text) && !nonempty(c.image)) errors.push(`${label} 選項 ${c.id}：缺少內容`);
        image(c.image, c.alt, `${label} 選項 ${c.id}`);
      }
      if (![1, 2, 3, 4].includes(q.answer)) errors.push(`${label}：答案無效`);
      const pageRequired = q.source.kind !== "image";
      if (!nonempty(q.source.file) || (pageRequired && q.source.page === undefined) ||
          (q.source.page !== undefined && (!Number.isInteger(q.source.page) || q.source.page <= 0))) errors.push(`${label}：來源資訊無效`);
      for (const original of q.source.images ?? []) {
        if (!/^\/source-images\/[a-z0-9-]+\/[a-z0-9_-]+\.(jpg|jpeg|png|webp)$/.test(original) || (assetExists && !assetExists(original)))
          errors.push(`${label}：原始圖片不存在或路徑無效`);
      }
      if (q.referenceUrl) {
        try { if (!["https:", "http:"].includes(new URL(q.referenceUrl).protocol)) throw new Error(); }
        catch { errors.push(`${label}：參考網址無效`); }
      }
    }
    if (set.id === "114-jintounao" && (set.questions.length !== 60 || Array.from({ length: 60 }, (_, i) => i + 1).some((n) => !numbers.has(n))))
      errors.push(`${set.id}：須完整包含第 1 至 60 題`);
  }
  return errors;
}
