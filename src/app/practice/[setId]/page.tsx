import { notFound } from "next/navigation";
import { questionSets, getQuestionSet } from "@/data/questionSets";
import { QuestionPractice } from "@/components/QuestionPractice";

export const dynamicParams = false;

export function generateStaticParams() {
  return questionSets.map((set) => ({ setId: set.id }));
}

export default async function PracticePage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params;
  const set = getQuestionSet(setId);
  if (!set) notFound();
  return <QuestionPractice set={set} />;
}
