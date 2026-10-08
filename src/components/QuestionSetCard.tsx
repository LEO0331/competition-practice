"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Restore browser-only storage after hydration without overwriting saved progress. */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { QuestionSetSummary } from "@/types/question";
import { countAnswered, countCorrect, createProgress, createRandomProgress, loadProgress, saveProgress, type Progress } from "@/lib/progress";
import { clearReviewSession } from "@/lib/review";

export function QuestionSetCard({ set }: { set: QuestionSetSummary }) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [confirmRestart, setConfirmRestart] = useState<"sequential" | "random" | null>(null);
  const [storageFailed, setStorageFailed] = useState(false);
  const restartButton = useRef<HTMLButtonElement>(null);
  const randomButton = useRef<HTMLButtonElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  useEffect(() => { setProgress(loadProgress(set)); }, [set]);
  useEffect(() => { if (confirmRestart) cancelButton.current?.focus(); }, [confirmRestart]);
  const answered = progress ? countAnswered(set, progress) : 0;
  const hasProgress = progress && (progress.completed || progress.position > 0 || answered > 0 || progress.questionOrder !== undefined);

  function cancelRestart() {
    const trigger = confirmRestart === "random" ? randomButton : restartButton;
    setConfirmRestart(null);
    setStorageFailed(false);
    trigger.current?.focus();
  }
  function restart(mode: "sequential" | "random") {
    const fresh = mode === "random" ? createRandomProgress(set) : createProgress(set);
    if (!saveProgress(set, fresh)) { setStorageFailed(true); return; }
    clearReviewSession(set);
    setProgress(fresh);
    setConfirmRestart(null);
    router.push(`/practice/${set.id}/`);
  }

  return (
    <article className="card set-card">
      <h2>{set.title}</h2>
      <p className="set-count">共 {set.questions.length} 題</p>
      {progress?.completed ? <p>上次練習：答對 {countCorrect(set, progress)} / {set.questions.length} 題</p>
        : hasProgress && <p>已完成 {answered} / {set.questions.length} 題</p>}
      <div className="actions">
        {!progress ? <button className="button" disabled>正在讀取進度…</button> : <Link className="button" href={`/practice/${set.id}/`}>{progress.completed ? "查看上次結果" : hasProgress ? "繼續上次進度" : "開始練習"}</Link>}
        {progress && <button ref={randomButton} type="button" className="button secondary" aria-expanded={confirmRestart === "random"} aria-controls={`restart-${set.id}`} onClick={() => hasProgress ? setConfirmRestart("random") : restart("random")}>{hasProgress ? "隨機重新練習" : "隨機練習"}</button>}
        {hasProgress && <button ref={restartButton} type="button" className="button secondary" aria-expanded={confirmRestart === "sequential"} aria-controls={`restart-${set.id}`} onClick={() => setConfirmRestart("sequential")}>從第一題開始</button>}
      </div>
      {confirmRestart && <section id={`restart-${set.id}`} className="restart-confirmation" aria-labelledby={`restart-label-${set.id}`}>
        <p id={`restart-label-${set.id}`}>{confirmRestart === "random" ? "要開始新的隨機練習嗎？目前的練習進度會重新開始。" : "要從第一題重新開始嗎？目前的練習進度會重新開始。"}</p>
        <div className="actions">
          <button ref={cancelButton} type="button" className="button secondary" onClick={cancelRestart}>取消</button>
          <button type="button" className="button" onClick={() => restart(confirmRestart)}>{confirmRestart === "random" ? "開始隨機練習" : "重新開始"}</button>
        </div>
      </section>}
      {storageFailed && <p className="storage-warning" role="alert">瀏覽器無法儲存新的進度，尚未重新開始。請繼續原本的練習。</p>}
    </article>
  );
}
