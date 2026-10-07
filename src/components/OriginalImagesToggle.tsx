"use client";

import { setShowOriginalImages, useShowOriginalImages } from "@/lib/originalImages";

export function OriginalImagesToggle() {
  const enabled = useShowOriginalImages();
  return (
    <label className="original-images-toggle" title="套用所有題庫，作答後顯示原始圖片">
      <input type="checkbox" checked={enabled} onChange={(event) => setShowOriginalImages(event.target.checked)} aria-label="所有題庫顯示原始圖片" />
      <span>顯示原圖</span>
    </label>
  );
}
