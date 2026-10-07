"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Restore browser-only storage after hydration; exported HTML must remain independent of saved progress. */
/* eslint-disable @next/next/no-img-element -- Source PDF crops retain their intrinsic proportions as static assets. */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Choice, QuestionSet } from "@/types/question";
import { answerQuestion, countCorrect, createProgress, createRandomProgress, sessionQuestions, loadProgress, moveToQuestion, progressKey, saveProgress, type Progress } from "@/lib/progress";
import { clearReviewSession, createReviewSession, incorrectQuestionIds, loadReviewSession, reviewQuestionSet, saveReviewSession, type ReviewSession } from "@/lib/review";
import { QuestionChoice } from "./QuestionChoice";
import { questionSourceLabel } from "@/lib/sources";

const originalImagesKey = "competition-practice:show-original-images:v1";

export function QuestionPractice({ set }: { set: QuestionSet }) {
  const [fullProgress, setFullProgress] = useState<Progress | null>(null);
  const [review, setReview] = useState<ReviewSession | null>(null);
  const [storageFailed, setStorageFailed] = useState(false);
  const [showOriginalImages, setShowOriginalImages] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    try { setShowOriginalImages(window.localStorage.getItem(originalImagesKey) === "true"); }
    catch { /* Keep the default when browser storage is unavailable. */ }
    const saved = loadProgress(set);
    setFullProgress(saved);
    const url = new URL(window.location.href);
    const savedReview = url.searchParams.get("review") === "1" ? loadReviewSession(set) : null;
    const wrong = new Set(incorrectQuestionIds(set, saved));
    const validReview = saved.completed && savedReview && savedReview.questionIds.every((id) => wrong.has(id));
    setReview(validReview ? savedReview : null);
    if (!validReview) url.searchParams.delete("review");
    // Old bookmarked restart links must never reset progress without confirmation.
    url.searchParams.delete("restart");
    window.history.replaceState(window.history.state, "", url.toString());
    try { window.localStorage.getItem(progressKey(set)); }
    catch { setStorageFailed(true); }
  }, [set]);

  function toggleOriginalImages(enabled: boolean) {
    setShowOriginalImages(enabled);
    try { window.localStorage.setItem(originalImagesKey, String(enabled)); }
    catch { /* The preference still works for the current page. */ }
  }

  function focusQuestion() {
    window.requestAnimationFrame(() => heading.current?.focus());
  }
  function setReviewUrl(active: boolean) {
    const url = new URL(window.location.href);
    if (active) url.searchParams.set("review", "1");
    else url.searchParams.delete("review");
    window.history.replaceState(window.history.state, "", url.toString());
  }
  function update(next: Progress, focus = false) {
    if (review) {
      const session = { ...review, progress: next };
      setReview(session);
      setStorageFailed(!saveReviewSession(set, session));
    } else {
      setFullProgress(next);
      setStorageFailed(!saveProgress(set, next));
    }
    if (focus) focusQuestion();
  }
  function startReview(activeSet: QuestionSet, progress: Progress) {
    const fresh = createReviewSession(activeSet, progress);
    if (!fresh) return;
    const saved = review ? null : loadReviewSession(set);
    const session = saved && !saved.progress.completed && saved.questionIds.join(",") === fresh.questionIds.join(",") ? saved : fresh;
    setReview(session);
    setStorageFailed(!saveReviewSession(set, session));
    setReviewUrl(true);
    focusQuestion();
  }
  function returnToFullResult() {
    setReview(null);
    setReviewUrl(false);
    focusQuestion();
  }
  function restart(activeSet: QuestionSet) {
    if (!review) clearReviewSession(set);
    update(!review && fullProgress?.questionOrder ? createRandomProgress(set) : createProgress(activeSet), true);
  }

  if (!fullProgress) return <section className="card page-intro" aria-live="polite"><h1>正在讀取練習進度…</h1></section>;
  const activeSet = review ? reviewQuestionSet(set, review.questionIds) : set;
  const progress = review?.progress ?? fullProgress;
  const question = sessionQuestions(activeSet, progress)[progress.position];
  const modeLabel = review ? "・錯題再練習" : progress.questionOrder ? "・隨機練習" : "";
  const storageWarning = storageFailed && <p className="storage-warning" role="alert">這個瀏覽器無法儲存進度。你仍可繼續練習，但關閉頁面後，這次的進度可能不會保留。</p>;

  if (progress.completed) {
    const wrongCount = incorrectQuestionIds(activeSet, progress).length;
    return (
      <section className="card completion">
        <p className="set-label">{set.title}{modeLabel}</p>
        <h1 ref={heading} tabIndex={-1}>{review ? "錯題練習完成" : "本次練習完成"}</h1>
        <p>共 {activeSet.questions.length} 題，答對 {countCorrect(activeSet, progress)} 題。</p>
        {storageWarning}
        <div className="actions">
          {wrongCount > 0 && <button type="button" className="button" onClick={() => startReview(activeSet, progress)}>只練錯題（{wrongCount} 題）</button>}
          <button type="button" className={`button${wrongCount > 0 ? " secondary" : ""}`} onClick={() => restart(activeSet)}>{!review && progress.questionOrder ? "再次隨機練習" : "再練習一次"}</button>
          {review && <button type="button" className="button secondary" onClick={returnToFullResult}>回到完整練習結果</button>}
          <Link className="button secondary" href="/">回到首頁</Link>
        </div>
      </section>
    );
  }
  if (!question) return <section className="card"><h1>這份題庫還沒有題目</h1><Link className="button" href="/">回到首頁</Link></section>;
  const selected = progress.answers[question.id];
  const answered = selected !== undefined;
  const correctChoice = question.choices.find((choice) => choice.id === question.answer);
  const correctLabel = `選項 ${question.answer}${correctChoice?.text ? `：${correctChoice.text}` : "（圖片）"}`;
  return (
    <>
      <div className="practice-top"><Link className="text-link" href="/">回到首頁</Link><p className="set-label">{set.title}{modeLabel}</p></div>
      <div className="progress-line"><p>第 {progress.position + 1} 題 / 共 {activeSet.questions.length} 題</p><p>答對 {countCorrect(activeSet, progress)} 題</p></div>
      {storageWarning}
      <label className="original-images-toggle">
        <input type="checkbox" checked={showOriginalImages} onChange={(event) => toggleOriginalImages(event.target.checked)} aria-describedby="original-images-hint" />
        <span>顯示原始圖片</span>
      </label>
      <p id="original-images-hint" className="original-images-hint">開啟後，作答完會顯示原圖。</p>
      <section className="card question-card" aria-labelledby="question-heading">
        <h1 id="question-heading" ref={heading} tabIndex={-1} className="question-text">{question.text}</h1>
        {question.image && <img className="question-image" src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}${question.image}`} alt={question.imageAlt || `第 ${question.number} 題的圖片`} />}
        <p className="instruction">{answered ? "這題已作答，請閱讀題解後繼續。" : "請點選一個答案。"}</p>
        <div className="choices">{question.choices.map((choice) => <QuestionChoice key={choice.id} choice={choice} selected={selected} answer={question.answer} onChoose={(id: Choice["id"]) => update(answerQuestion(activeSet, progress, id))} />)}</div>
        {answered && <section className={`answer-panel ${selected === question.answer ? "answer-correct" : "answer-incorrect"}`} aria-live="polite" aria-atomic="true">
          <h2>{selected === question.answer ? "答對了" : "這題答錯了"}</h2>
          <p><strong>正確答案：{correctLabel}</strong></p>
          <h3>題解</h3><p className="explanation">{question.explanation || "原始題庫未提供題解"}</p>
          <p className="source">{questionSourceLabel(question.source)}</p>
          {question.source.note && <p className="source-notice">{question.source.note}</p>}
          {showOriginalImages && question.source.images && <div className="source-original">
            <h3>原始圖片</h3>
            {question.source.images.map((path) => <img className="study-image" loading="lazy" src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}${path}`} alt="這題的原始圖片，包含來源答案" key={path} />)}
          </div>}
          {question.referenceUrl && <p><a className="text-link source" href={question.referenceUrl} target="_blank" rel="noopener noreferrer">原始參考資料（另開視窗）</a></p>}
        </section>}
        <div className="question-navigation">
          <button type="button" className="button secondary" disabled={progress.position === 0} onClick={() => update(moveToQuestion(activeSet, progress, progress.position - 1), true)}>上一題</button>
          <button type="button" className="button" disabled={!answered} onClick={() => update(moveToQuestion(activeSet, progress, progress.position + 1), true)}>{progress.position === activeSet.questions.length - 1 ? "查看練習結果" : "下一題"}</button>
        </div>
      </section>
    </>
  );
}
