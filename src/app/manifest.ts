import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");
  return {
    name: "競賽複習題庫",
    short_name: "競賽題庫",
    description: "簡單易用的環境知識競賽題庫練習網站，適合逐題複習與賽前準備。",
    lang: "zh-Hant",
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    theme_color: "#255d49",
    background_color: "#f7f8f4",
    icons: [
      { src: `${basePath}/app-icons/icon.svg`, sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: `${basePath}/app-icons/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${basePath}/app-icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
