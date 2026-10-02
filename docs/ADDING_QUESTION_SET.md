# 新增一份題庫

1. 將新 PDF 逐列轉錄到 `src/data/questionSets/<題庫代號>.ts`，匯出符合 `QuestionSet` 的資料。以原始 PDF 為準，只整理換行與版面空白，不修改答案或補寫題解。
2. 型別位於 `src/types/question.ts`：`QuestionSet` 包含 `id`、`title`、`sourceFile`、`questions`，可加 `subtitle`、`year`。每題使用穩定 `id`、正整數 `number`、`text`、四個 `choices`、`answer`、`source: { file, page }`。選項 `id` 與答案均為 1–4。題解缺漏時使用 `null`；原始網址放在 `referenceUrl`。
3. 題目圖片放在 `public/question-assets/<題庫代號>/`。資料中的 `image` 使用 `/question-assets/...` 路徑。題目用 `imageAlt`，選項用 `alt`，描述原圖而不洩漏答案。選項可有文字、圖片或兩者。
4. 在 `src/data/questionSets/index.ts` 匯入並加入 `questionSets`。題目依題號升冪排列；首頁題庫卡片、題數、練習路由會自動新增。每份 PDF 為獨立題庫，不自行發明分類。
5. 每題的 `source.file` 保留完整 PDF 檔名，`source.page` 為從 1 開始的實際頁碼。逐頁渲染原 PDF，逐列對照題目、選項、答案與題解；模糊處寫進 `docs/source-review.md`，不要猜測。
6. 執行 `npm run validate:data`、`npm run lint`、`npm run typecheck`、`npm test`、`npm run build`。驗證會檢查識別碼、題號、四個選項、答案、圖片檔案與來源資料；第一份題庫另檢查 60 題完整性。
7. 使用 Node.js 24：`npm ci`、`npm run dev`，開啟 `http://localhost:3000`。
8. 檢查圖片題：裁切只含題目／選項圖片，不含答案欄；在手機與桌機開啟，確認順序、比例、替代文字及答題前沒有答案提示。再檢查重新整理、上一題、完成與重新練習。
9. GitHub 的 **Settings → Pages → Source** 設為 **GitHub Actions**。推送至 `main` 或執行部署工作流程，即會驗證並部署 `out/`。專案網站部署路徑取自目前儲存庫名稱，改名後重新部署即可；另會檢查匯出 HTML 的資源前綴及檔案存在。本機開發不需要設定路徑。

進度僅存於目前瀏覽器，各題庫分開。新增資料時避免變更既有題目識別碼；若題目或答案有實質修訂，請使用新的題庫代號，避免舊進度誤套。

圖片題目可設定 `source.kind: "image"`，保留原檔名、`questionLabel` 及 `images` 原圖路徑；沒有可靠頁碼時省略 `page`，不假造 PDF 頁碼。只有四個完整選項及明示答案的題目才納入作答題庫。純筆記或圖卡使用 `src/data/studyCollections/` 的 `StudyCollection`，登錄後自動出現在首頁「複習資料」。原圖保存在 `public/source-images/environment/`，逐檔清單及轉錄問題見 `src/data/imageSources.ts`、`docs/IMAGE_SOURCE_REVIEW.md`。

`StudyPage.tocLabel` 為可選的目錄／跳頁標籤，只用在來源標題較籠統時，簡短概括該頁已有內容。沒有設定時沿用 `title`；來源標題與正文不修改，也不需要新增分類。
