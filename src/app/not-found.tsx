import Link from "next/link";

export default function NotFound() {
  return <section className="card page-intro"><h1>找不到這個頁面</h1><p>請回到首頁，選擇想練習的題庫。</p><Link className="button" href="/">回到首頁</Link></section>;
}
