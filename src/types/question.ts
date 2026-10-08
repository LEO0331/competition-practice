export type ChoiceId = 1 | 2 | 3 | 4;
export type Choice = { id: ChoiceId; text?: string; image?: string; alt?: string };
export type Question = {
  id: string;
  number: number;
  text: string;
  image?: string;
  imageAlt?: string;
  choices: Choice[];
  answer: ChoiceId;
  explanation?: string | null;
  referenceUrl?: string;
  source: {
    file: string;
    page?: number;
    kind?: "pdf" | "image";
    questionLabel?: string;
    images?: string[];
    note?: string;
  };
};
export type QuestionSet = {
  id: string;
  title: string;
  subtitle?: string;
  year?: string;
  sourceFile: string;
  questions: Question[];
  progressSources?: { id: string; questionIds: string[]; questionIdMap?: Record<string, string> }[];
};

// Progress needs IDs and answers, not the source text or image metadata.
export type ProgressQuestionSet = Pick<QuestionSet, "id" | "progressSources"> & {
  questions: Pick<Question, "id" | "answer">[];
};
export type QuestionSetSummary = ProgressQuestionSet & Pick<QuestionSet, "title">;
