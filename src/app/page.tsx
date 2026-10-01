import { questionSets } from "@/data/questionSets";
import { QuestionSetCard } from "@/components/QuestionSetCard";

export default function HomePage() {
  return (
    <>
      <section className="page-intro"><h1>一題一題，安心練習</h1><p>用簡單的方式，一題一題練習競賽題目。</p></section>
      <section className="set-list" aria-label="選擇題庫">
        {questionSets.map((set) => <QuestionSetCard key={set.id} set={set} />)}
        {questionSets.length === 0 && <p className="card">題庫準備中，請稍後再來。</p>}
      </section>
    </>
  );
}
