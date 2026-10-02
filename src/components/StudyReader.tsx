"use client";
/* eslint-disable react-hooks/set-state-in-effect -- Restore reading position without changing storage on hydration. */
/* eslint-disable @next/next/no-img-element -- Original source images are static assets with their own proportions. */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { StudyCollection } from "@/types/study";
import { isStudyPosition, loadStudyPosition, saveStudyPosition, studyPageLabel } from "@/lib/study";

export function StudyReader({ collection }: { collection: StudyCollection }) {
  const [position, setPosition] = useState<number | null>(null);
  const [storageFailed, setStorageFailed] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { setPosition(loadStudyPosition(collection)); }, [collection]);
  function go(index: number) {
    if (!isStudyPosition(collection, index)) return;
    setPosition(index);
    setStorageFailed(!saveStudyPosition(collection, index));
    window.requestAnimationFrame(() => heading.current?.focus());
  }
  if (position === null) return <p className="page-intro" aria-live="polite">正在讀取複習內容…</p>;
  const page = collection.pages[position];
  if (!page) return <p className="page-intro">複習內容準備中。</p>;
  const originalImage = <img className="study-image" loading="lazy" src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}${page.image}`} alt={page.imageAlt} />;
  return <>
    <div className="practice-top"><Link className="text-link" href="/">回到首頁</Link><p className="set-label">{collection.title}</p></div>
    <p className="progress-line">第 {position + 1} 頁 / 共 {collection.pages.length} 頁</p>
    <div className="study-page-jump">
      <label htmlFor="study-page-select">跳到其他頁</label>
      <select id="study-page-select" className="study-page-select" value={position} onChange={(event) => go(Number(event.target.value))}>
        {collection.pages.map((item, index) => <option key={item.id} value={index}>{index + 1} — {studyPageLabel(item)}</option>)}
      </select>
    </div>
    <details className="study-toc">
      <summary>複習目錄</summary>
      <ol className="study-toc-list">
        {collection.pages.map((item, index) => <li key={item.id}>
          <button type="button" className="button secondary study-toc-item" aria-current={index === position ? "page" : undefined} onClick={() => go(index)}>
            第 {index + 1} 頁　{studyPageLabel(item)}{index === position && "（目前頁面）"}
          </button>
        </li>)}
      </ol>
    </details>
    <article className="card study-card">
      <h1 ref={heading} tabIndex={-1}>{page.title}</h1>
      {page.notice && <p className="source-notice">{page.notice}</p>}
      {page.showImage && originalImage}
      {page.sections.map((section, index) => <section className="study-section" key={index}>
        {section.heading && section.heading !== page.title && <h2>{section.heading}</h2>}
        <p className="study-text">{section.text}</p>
      </section>)}
      <p className="source study-section">來源：{page.source.file}{page.source.page ? `，第 ${page.source.page} 頁` : ""}</p>
      {!page.showImage && <details className="source-original" key={page.id}><summary>查看原始圖片</summary>{originalImage}</details>}
      <a className="text-link" href={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}${page.image}`} target="_blank" rel="noopener noreferrer">開啟原圖（另開視窗）</a>
      {storageFailed && <p className="storage-warning" role="alert">這個瀏覽器無法儲存閱讀位置，你仍可繼續閱讀。</p>}
      <div className="question-navigation">
        <button type="button" className="button secondary" disabled={position === 0} onClick={() => go(position - 1)}>上一頁</button>
        {position + 1 < collection.pages.length ? <button type="button" className="button" onClick={() => go(position + 1)}>下一頁</button> : <Link className="button" href="/">回到首頁</Link>}
      </div>
    </article>
  </>;
}
