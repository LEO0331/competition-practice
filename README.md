# 競賽複習題庫

讓長輩用簡單的方式，一題一題練習競賽題目。全站使用繁體中文、大字與大按鈕；點選答案後立即顯示結果與原始題解。

目前收錄「114 群英會－金頭腦」，共 60 題，包含原 PDF 圖片題。內容與答案依原始資料保留，沒有題解時不補寫。來源核對紀錄見 [source-review.md](docs/source-review.md)。

## 本機使用

使用 Node.js 24：

```sh
npm ci
npm run dev
```

開啟 `http://localhost:3000`。首頁 `/` 選擇題庫，`/practice/114-jintounao/` 逐題練習。進度以版本化鍵名存於瀏覽器 localStorage，各題庫獨立保存；同一裝置、同一瀏覽器可接續。清除瀏覽器資料會清除進度。

## 技術與資料

Next.js App Router、React、TypeScript，完整靜態匯出，使用系統字型與本機圖片。資料位於 `src/data/questionSets/`，型別位於 `src/types/question.ts`，圖片位於 `public/question-assets/`。不需要帳號、資料庫或伺服器。

新增 PDF 請依 [新增題庫指南](docs/ADDING_QUESTION_SET.md) 添加資料、圖片與題庫登錄。首頁與路由會自動產生。

## 驗證

```sh
npm run validate:data
npm run lint
npm run typecheck
npm test
npm run build
```

測試使用 Node.js 內建測試工具，涵蓋題庫、排序、查找、進度保存與作答鎖定。`build` 匯出至 `out/`。圖片與全部 60 題均需對照來源 PDF，結構驗證不能取代逐字核對。

## GitHub Pages

在儲存庫 **Settings → Pages → Source** 選擇 **GitHub Actions**。推送至 `main` 時，部署流程會安裝、驗證、檢查、測試、建置並部署靜態頁面。PR 流程也執行全部檢查。

部署路徑使用目前儲存庫名稱，不固定名稱，也不依賴改名後可能尚未更新的 Pages 路徑資料。本機預設為空路徑。改名後重新執行部署即可。可用 `PAGES_BASE_PATH=/新儲存庫名稱` 建置，再執行 `node scripts/check-export.mjs` 檢查靜態資源。

目前部署流程使用 GitHub Pages 專案網站路徑；若改用帳號網站或自訂網域，需另調整部署前綴。實際線上部署須等待 GitHub 工作流程成功；本機建置不代表已發布。

