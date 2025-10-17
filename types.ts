export interface Source {
  title: string;
  uri: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  sources: Source[];
}
