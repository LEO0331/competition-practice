/* eslint-disable @next/next/no-img-element -- Source PDF crops keep their intrinsic proportions and are served as static assets. */
import type { Choice } from "@/types/question";

const labels = { 1: "①", 2: "②", 3: "③", 4: "④" };

export function QuestionChoice({ choice, selected, answer, onChoose }: {
  choice: Choice;
  selected?: Choice["id"];
  answer: Choice["id"];
  onChoose: (id: Choice["id"]) => void;
}) {
  const answered = selected !== undefined;
  const correct = answered && choice.id === answer;
  const incorrect = answered && choice.id === selected && !correct;
  return (
    <button type="button" className={`choice${correct ? " correct" : ""}${incorrect ? " incorrect" : ""}`} disabled={answered} onClick={() => onChoose(choice.id)}>
      <span className="choice-number">{labels[choice.id]}</span>
      <span className="choice-content">
        {choice.text && <span>{choice.text}</span>}
        {choice.image && <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}${choice.image}`} alt={choice.alt || `選項 ${choice.id} 的圖片`} className="choice-image" />}
        {correct && <strong className="choice-status">正確答案{selected === choice.id ? "・你的選擇" : ""}</strong>}
        {incorrect && <strong className="choice-status">你的選擇・答錯了</strong>}
      </span>
    </button>
  );
}
