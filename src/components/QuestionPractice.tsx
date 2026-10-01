"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Restore browser-only storage after hydration; the exported HTML must remain independent of saved progress. */
/* eslint-disable @next/next/no-img-element -- Source PDF crops keep their intrinsic proportions and are served as static assets. */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Choice, QuestionSet } from "@/types/question";
import { answerQuestion, countCorrect, createProgress, loadProgress, moveToQuestion, progressKey, saveProgress, type Progress } from "@/lib/progress";
import { QuestionChoice } from "./QuestionChoice";

export function QuestionPractice({ set }: { set: QuestionSet }) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [storageFailed, setStorageFailed] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("restart") === "1") {
      const fresh = createProgress(set);
      setProgress(fresh);
      setStorageFailed(!saveProgress(set, fresh));
      url.searchParams.delete("restart");
      window.history.replaceState(window.history.state, "", url.toString());
    } else {
      setProgress(loadProgress(set));
      try { window.localStorage.getItem(progressKey(set)); }
      catch { setStorageFailed(true); }
    }
  }, [set]);

  function update(next: Progress, focusQuestion = false) {
    setProgress(next);
    setStorageFailed(!saveProgress(set, next));
    if (focusQuestion) window.requestAnimationFrame(() => heading.current?.focus());
  }

  function choose(id: Choice["id"]) {
    if (!progress) return;
    update(answerQuestion(set, progress, id));
  }

  if (!progress) return <section className="card page-intro" aria-live="polite"><h1>正在讀取練習進度…</h1></section>;
  const question = set.questions[progress.position];
  const storageWarning = storageFailed && <p className="storage-warning" role="alert">這個瀏覽器無法儲存進度。你仍可繼續練習，但關閉頁面後，這次的進度可能不會保留。</p>;

  if (progress.completed) return (
    <section className="card completion">
      <p className="set-label">{set.title}</p>
      <h1 ref={heading} tabIndex={-1}>本次練習完成</h1>
      <p>共 {set.questions.length} 題，答對 {countCorrect(set, progress)} 題。</p>
      {storageWarning}
      <div className="actions"><button className="button" onClick={() => update(createProgress(set), true)}>再練習一次</button><Link className="button secondary" href="/">回到首頁</Link></div>
    </section>
  );
  if (!question) return <section className="card"><h1>這份題庫還沒有題目</h1><Link className="button" href="/">回到首頁</Link></section>;
  const selected = progress.answers[question.id];
  const answered = selected !== undefined;
  const correctChoice = question.choices.find((choice) => choice.id === question.answer);
  const correctLabel = `選項 ${question.answer}${correctChoice?.text ? `：${correctChoice.text}` : "（圖片）"}`;
  return (
    <>
      <div className="practice-top"><Link className="text-link" href="/">回到首頁</Link><p className="set-label">{set.title}</p></div>
      <div className="progress-line"><p>第 {progress.position + 1} 題 / 共 {set.questions.length} 題</p><p>答對 {countCorrect(set, progress)} 題</p></div>
      {storageWarning}
      <section className="card question-card" aria-labelledby="question-heading">
        <h1 id="question-heading" ref={heading} tabIndex={-1} className="question-text">{question.text}</h1>
        {question.image && <img className="question-image" src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}${question.image}`} alt={question.imageAlt || `第 ${question.number} 題的圖片`} />}
        <p className="instruction">{answered ? "這題已作答，請閱讀題解後繼續。" : "請點選一個答案。"}</p>
        <div className="choices">{question.choices.map((choice) => <QuestionChoice key={choice.id} choice={choice} selected={selected} answer={question.answer} onChoose={choose} />)}</div>
        {answered && <section className={`answer-panel ${selected === question.answer ? "answer-correct" : "answer-incorrect"}`} aria-live="polite" aria-atomic="true">
          <h2>{selected === question.answer ? "答對了" : "這題答錯了"}</h2>
          <p><strong>正確答案：{correctLabel}</strong></p>
          <h3>題解</h3><p className="explanation">{question.explanation || "原始題庫未提供題解"}</p>
          <p className="source">來源：{question.source.file}，第 {question.source.page} 頁</p>
          {question.referenceUrl && <p><a className="text-link source" href={question.referenceUrl} target="_blank" rel="noopener noreferrer">原始參考資料（另開視窗）</a></p>}
        </section>}
        <div className="question-navigation">
          <button className="button secondary" disabled={progress.position === 0} onClick={() => update(moveToQuestion(set, progress, progress.position - 1), true)}>上一題</button>
          <button className="button" disabled={!answered} onClick={() => update(moveToQuestion(set, progress, progress.position + 1), true)}>{progress.position === set.questions.length - 1 ? "查看練習結果" : "下一題"}</button>
        </div>
      </section>
    </>
  );
}
