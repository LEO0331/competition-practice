import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export const metadata: Metadata = {
  title: "競賽複習題庫",
  applicationName: "競賽複習題庫",
  description: "簡單易用的環境知識競賽題庫練習網站，適合逐題複習與賽前準備。",
  icons: {
    icon: { url: `${basePath}/app-icons/icon.svg`, type: "image/svg+xml" },
    apple: { url: `${basePath}/app-icons/apple-touch-icon.png`, sizes: "180x180", type: "image/png" },
  },
  appleWebApp: { capable: true, title: "競賽題庫", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#255d49",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-Hant">
      <body>
        <a className="skip-link" href="#main-content">跳到主要內容</a>
        <header className="site-header"><div className="container"><Link className="brand" href="/">競賽複習題庫</Link></div></header>
        <main id="main-content" className="container">{children}</main>
        <footer className="site-footer container">練習進度保存在這個瀏覽器，換裝置時不會同步。</footer>
      </body>
    </html>
  );
}
