import { questionSets } from "@/data/questionSets";
import { QuestionSetCard } from "@/components/QuestionSetCard";
import { studyCollections } from "@/data/studyCollections";
import { StudyCollectionCard } from "@/components/StudyCollectionCard";

export default function HomePage() {
  return (
    <>
      <section className="page-intro"><h1>環保志工群英會</h1></section>
      <section className="set-list" aria-label="選擇題庫">
        {questionSets.map((set) => <QuestionSetCard key={set.id} set={set} />)}
        {questionSets.length === 0 && <p className="card">題庫準備中，請稍後再來。</p>}
      </section>
      {studyCollections.length > 0 && <section className="study-home" aria-labelledby="study-title">
        <h2 id="study-title">複習資料</h2>
        <div className="set-list">{studyCollections.map((collection) => <StudyCollectionCard key={collection.id} collection={collection} />)}</div>
      </section>}
    </>
  );
}
