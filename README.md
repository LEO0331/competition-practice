# 競賽複習題庫

用簡單的方式，一題一題練習競賽題目。

為準備競賽的長輩設計，採用清楚的大字、大按鈕與簡單操作。在手機、平板或電腦上打開就能開始，不必註冊或登入。

**[前往題庫，開始練習](https://leo0331.github.io/competition-practice/)**

## 怎麼使用

1. 選擇想練習的題庫，按「開始練習」。
2. 閱讀題目，直接點選一個答案。
3. 查看答題結果、正確答案與題解，再按「下一題」。
4. 完成後查看答對題數，也可以「再練習一次」。

想回頭複習時，可以按「上一題」。已作答的題目會保留原本的選擇；開始新一輪練習後，就能重新作答。

## 隨時停下，下次接著練習

練習進度會自動保存在目前的瀏覽器。下次用同一台裝置、同一個瀏覽器開啟網站，按「繼續上次進度」就能接著練習。

想重新開始，可以在首頁按「從第一題開始」。這會清除該份題庫的上次進度。

進度不會在不同裝置或瀏覽器之間同步。清除瀏覽器的網站資料，也會清除已保存的進度。

## 目前有哪些題目

**114 群英會－金頭腦：共 60 題**，包含文字題與圖片題。

題目、選項、答案與題解依原始 PDF 保留。有些題目原本沒有題解，網站會顯示「原始題庫未提供題解」，不另行補寫。作答後也能看到來源檔名與頁碼，方便對照。

之後可加入其他競賽題庫，每份題庫都能分別練習、保存進度。

<details>
<summary>維護與本機開發</summary>

### 本機啟動

使用 Node.js 24：

```sh
npm ci
npm run dev
```

開啟 `http://localhost:3000`。

### 題庫與技術

網站使用 Next.js App Router、React 與 TypeScript，靜態匯出後部署於 GitHub Pages。進度僅存於瀏覽器 localStorage，不需要後端或資料庫。

- 題庫資料：`src/data/questionSets/`
- 題目型別：`src/types/question.ts`
- 圖片素材：`public/question-assets/`
- 新增題庫：[新增題庫指南](docs/ADDING_QUESTION_SET.md)
- 原始資料核對：[來源複核紀錄](docs/source-review.md)

### 驗證與部署

```sh
npm run validate:data
npm run lint
npm run typecheck
npm test
npm run build
```

建置結果位於 `out/`。GitHub 的 **Settings → Pages → Source** 設為 **GitHub Actions** 後，推送至 `main` 會自動檢查並部署；PR 也會執行檢查。

部署流程以目前儲存庫名稱產生專案網站路徑，並驗證匯出的 CSS 與 JavaScript 資源。儲存庫改名後重新部署即可；若改用帳號網站或自訂網域，需調整部署前綴。

</details>
