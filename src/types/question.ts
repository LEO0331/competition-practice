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
  source: { file: string; page: number };
};
export type QuestionSet = {
  id: string;
  title: string;
  subtitle?: string;
  year?: string;
  sourceFile: string;
  questions: Question[];
};
