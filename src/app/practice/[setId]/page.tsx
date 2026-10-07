import { notFound } from "next/navigation";
import { questionSets, questionSetAliases, getQuestionSet } from "@/data/questionSets";
import { QuestionPractice } from "@/components/QuestionPractice";

export const dynamicParams = false;

export function generateStaticParams() {
  return [...questionSets.map((set) => ({ setId: set.id })),
    ...Object.keys(questionSetAliases).map((setId) => ({ setId }))];
}

export default async function PracticePage({ params }: { params: Promise<{ setId: string }> }) {
  const { setId } = await params;
  const set = getQuestionSet(setId);
  if (!set) notFound();
  return <QuestionPractice set={set} />;
}
