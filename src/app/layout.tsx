import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "競賽複習題庫",
  description: "用簡單的方式，一題一題練習競賽題目。",
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
