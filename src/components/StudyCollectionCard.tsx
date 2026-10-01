"use client";
/* eslint-disable react-hooks/set-state-in-effect -- Read browser-only position after hydration. */

import { useEffect, useState } from "react";
import Link from "next/link";
import type { StudyCollection } from "@/types/study";
import { loadStudyPosition } from "@/lib/study";

export function StudyCollectionCard({ collection }: { collection: StudyCollection }) {
  const [position, setPosition] = useState<number | null>(null);
  useEffect(() => { setPosition(loadStudyPosition(collection)); }, [collection]);
  return <article className="card set-card">
    <h2>{collection.title}</h2>
    <p>共 {collection.pages.length} 頁</p>
    {collection.description && <p>{collection.description}</p>}
    {position !== null && position > 0 && <p>上次讀到第 {position + 1} 頁</p>}
    <div className="actions"><Link className="button" href={`/notes/${collection.id}/`}>{position !== null && position > 0 ? "繼續閱讀" : "閱讀複習內容"}</Link></div>
  </article>;
}
