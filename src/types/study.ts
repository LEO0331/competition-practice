export type StudyPage = {
  id: string;
  title: string;
  sections: { heading: string; text: string }[];
  image: string;
  imageAlt: string;
  showImage?: boolean;
  notice?: string;
  source: { file: string; page?: number };
};
export type StudyCollection = {
  id: string;
  title: string;
  description?: string;
  pages: StudyPage[];
};
