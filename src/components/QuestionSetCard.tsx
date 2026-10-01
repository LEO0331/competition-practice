"use client";

/* eslint-disable react-hooks/set-state-in-effect -- Restore browser-only storage after hydration so saved progress never flashes or gets overwritten. */

import { useEffect, useState } from "react";
import Link from "next/link";
import type { QuestionSet } from "@/types/question";
import { loadProgress, type Progress } from "@/lib/progress";

export function QuestionSetCard({ set }: { set: QuestionSet }) {
  const [progress, setProgress] = useState<Progress | null>(null);
  useEffect(() => { setProgress(loadProgress(set)); }, [set]);
  const hasProgress = progress && (progress.position > 0 || Object.keys(progress.answers).length > 0);
  return (
    <article className="card set-card">
      <h2>{set.title}</h2>
      {set.subtitle && <p>{set.subtitle}</p>}
      <p className="set-count">共 {set.questions.length} 題</p>
      {progress?.completed && <p>上次練習已完成，可以查看結果或再練習一次。</p>}
      <div className="actions">
        {!progress ? <button className="button" disabled>正在讀取進度…</button> : <Link className="button" href={`/practice/${set.id}/`}>{progress.completed ? "查看上次結果" : hasProgress ? "繼續上次進度" : "開始練習"}</Link>}
        {hasProgress && <Link className="button secondary" href={`/practice/${set.id}/?restart=1`}>從第一題開始</Link>}
      </div>
    </article>
  );
}
