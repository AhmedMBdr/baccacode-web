import { L10n } from '../models';

/** [English, Arabic] */
export type T = [en: string, ar: string];

export const L = (t: T): L10n => ({ en: t[0], ar: t[1] });

/** Join Markdown lines. Written as arrays so backticks never need escaping. */
export const md = (...rows: string[]): string => rows.join('\n');

/** Python source. String.raw keeps backslashes exactly as typed. */
export const py = String.raw;

export interface SeedQuestion {
  text: T;
  code?: string;
  /** A plain string is shown identically in both languages (code, numbers). */
  options: (string | T)[];
  correct: number;
  explanation: T;
}

export interface SeedExample {
  title: T;
  description: T;
  code: string;
  output: string;
  explanation: T;
}

export interface SeedWorked {
  title: T;
  statement: T;
  approach: T;
  solution: string;
  solutionExplanation: T;
  complexity: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

/** [contestId, index, name, rating, tags] */
export type SeedProblem = [number, string, string, number, string[]];

export interface SeedTopic {
  id: number;
  title: T;
  summary: T;
  minutes: number;
  prerequisites: number[];
  lessonTitle: T;
  lessonBody: { en: string; ar: string };
  examples: SeedExample[];
  worked: SeedWorked;
  problems: SeedProblem[];
  quiz: SeedQuestion[];
}
