import { notFound } from "next/navigation";
import { studyCollections, getStudyCollection } from "@/data/studyCollections";
import { StudyReader } from "@/components/StudyReader";
export const dynamicParams = false;
export function generateStaticParams() {
  return studyCollections.map((collection) => ({ collectionId: collection.id }));
}
export default async function NotesPage({ params }: { params: Promise<{ collectionId: string }> }) {
  const { collectionId } = await params;
  const collection = getStudyCollection(collectionId);
  if (!collection) notFound();
  return <StudyReader collection={collection} />;
}
