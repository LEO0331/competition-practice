"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Restore browser-only storage after hydration without overwriting saved progress. */

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { QuestionSet } from "@/types/question";
import { countAnswered, countCorrect, createProgress, loadProgress, saveProgress, type Progress } from "@/lib/progress";
import { clearReviewSession } from "@/lib/review";

export function QuestionSetCard({ set }: { set: QuestionSet }) {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const [storageFailed, setStorageFailed] = useState(false);
  const restartButton = useRef<HTMLButtonElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  useEffect(() => { setProgress(loadProgress(set)); }, [set]);
  useEffect(() => { if (confirmRestart) cancelButton.current?.focus(); }, [confirmRestart]);
  const answered = progress ? countAnswered(set, progress) : 0;
  const hasProgress = progress && (progress.position > 0 || answered > 0);

  function cancelRestart() {
    setConfirmRestart(false);
    setStorageFailed(false);
    restartButton.current?.focus();
  }
  function restart() {
    const fresh = createProgress(set);
    if (!saveProgress(set, fresh)) { setStorageFailed(true); return; }
    clearReviewSession(set);
    setProgress(fresh);
    setConfirmRestart(false);
    router.push(`/practice/${set.id}/`);
  }

  return (
    <article className="card set-card">
      <h2>{set.title}</h2>
      {set.subtitle && <p>{set.subtitle}</p>}
      <p className="set-count">共 {set.questions.length} 題</p>
      {progress?.completed ? <p>上次練習：答對 {countCorrect(set, progress)} / {set.questions.length} 題</p>
        : hasProgress && <p>已完成 {answered} / {set.questions.length} 題</p>}
      <div className="actions">
        {!progress ? <button className="button" disabled>正在讀取進度…</button> : <Link className="button" href={`/practice/${set.id}/`}>{progress.completed ? "查看上次結果" : hasProgress ? "繼續上次進度" : "開始練習"}</Link>}
        {hasProgress && <button ref={restartButton} type="button" className="button secondary" aria-expanded={confirmRestart} aria-controls={`restart-${set.id}`} onClick={() => setConfirmRestart(true)}>從第一題開始</button>}
      </div>
      {confirmRestart && <section id={`restart-${set.id}`} className="restart-confirmation" aria-labelledby={`restart-label-${set.id}`}>
        <p id={`restart-label-${set.id}`}>要從第一題重新開始嗎？目前的練習進度會重新開始。</p>
        <div className="actions">
          <button ref={cancelButton} type="button" className="button secondary" onClick={cancelRestart}>取消</button>
          <button type="button" className="button" onClick={restart}>重新開始</button>
        </div>
        {storageFailed && <p className="storage-warning" role="alert">瀏覽器無法儲存新的進度，尚未重新開始。請取消後繼續原本的練習。</p>}
      </section>}
    </article>
  );
}
