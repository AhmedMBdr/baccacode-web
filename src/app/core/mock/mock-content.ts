import {
  CodeExampleDto,
  CodeforcesProblemDto,
  LessonDto,
  QuizDto,
  QuizOptionDto,
  TopicContentDto,
  WorkedProblemDto,
  L10n,
} from '../models';
import { TOPICS_A } from './seed-topics-a';
import { TOPICS_B } from './seed-topics-b';
import { L, SeedQuestion, SeedTopic } from './seed-types';

/** Server-side question: holds the correct option, which is never sent before submission. */
export interface StoredOption {
  id: number;
  text: L10n;
}
export interface StoredQuestion {
  id: number;
  topicId: number;
  text: L10n;
  codeSnippet: string | null;
  options: StoredOption[];
  correctOptionId: number;
  explanation: L10n;
}

export interface StoredQuiz extends QuizDto {
  questionIds: number[];
}

export const SEED_TOPICS: SeedTopic[] = [...TOPICS_A, ...TOPICS_B];

export const questionId = (topicId: number, index: number) => topicId * 100 + index + 1;
export const optionId = (qId: number, index: number) => qId * 10 + index + 1;
export const quizIdForTopic = (topicId: number) => topicId * 10;
export const DIAGNOSTIC_QUIZ_ID = 900;

function toStored(topicId: number, q: SeedQuestion, index: number): StoredQuestion {
  const id = questionId(topicId, index);
  return {
    id,
    topicId,
    text: L(q.text),
    codeSnippet: q.code ?? null,
    options: q.options.map((o, i) => ({
      id: optionId(id, i),
      text: typeof o === 'string' ? { en: o, ar: o } : L(o),
    })),
    correctOptionId: optionId(id, q.correct),
    explanation: L(q.explanation),
  };
}

export const QUESTIONS = new Map<number, StoredQuestion>();
export const QUIZZES = new Map<number, StoredQuiz>();
export const PROBLEMS = new Map<number, CodeforcesProblemDto[]>();
export const CONTENT = new Map<number, TopicContentDto>();

for (const t of SEED_TOPICS) {
  const ids: number[] = [];
  t.quiz.forEach((q, i) => {
    const s = toStored(t.id, q, i);
    QUESTIONS.set(s.id, s);
    ids.push(s.id);
  });
  QUIZZES.set(quizIdForTopic(t.id), {
    id: quizIdForTopic(t.id),
    topicId: t.id,
    kind: 'Topic',
    title: { en: `${t.title[0]} quiz`, ar: `اختبار ${t.title[1]}` },
    questionCount: ids.length,
    estimatedMinutes: Math.max(5, ids.length * 1.5) | 0,
    questionIds: ids,
  });

  PROBLEMS.set(
    t.id,
    t.problems.map(([contestId, index, name, rating, tags], i) => ({
      id: t.id * 10 + i + 1,
      contestId,
      index,
      name,
      url: `https://codeforces.com/problemset/problem/${contestId}/${index}`,
      rating,
      tags,
      displayOrder: i + 1,
      solved: null,
    })),
  );

  const lesson: LessonDto = {
    id: t.id * 10 + 1,
    title: L(t.lessonTitle),
    bodyMarkdown: t.lessonBody,
    displayOrder: 1,
  };
  const examples: CodeExampleDto[] = t.examples.map((e, i) => ({
    id: t.id * 10 + i + 1,
    title: L(e.title),
    description: L(e.description),
    pythonCode: e.code,
    expectedOutput: e.output,
    explanation: L(e.explanation),
    displayOrder: i + 1,
  }));
  const worked: WorkedProblemDto = {
    id: t.id * 10 + 1,
    title: L(t.worked.title),
    statement: L(t.worked.statement),
    approach: L(t.worked.approach),
    pythonSolution: t.worked.solution,
    solutionExplanation: L(t.worked.solutionExplanation),
    complexity: t.worked.complexity,
    difficulty: t.worked.difficulty,
    displayOrder: 1,
  };
  CONTENT.set(t.id, { topicId: t.id, lessons: [lesson], codeExamples: examples, workedProblems: [worked] });
}

/** Optional first-visit check-up (8.1.1): five questions across the first two topics. */
const DIAGNOSTIC_QUESTION_IDS = [
  questionId(1, 0),
  questionId(1, 2),
  questionId(2, 0),
  questionId(2, 1),
  questionId(2, 3),
];
QUIZZES.set(DIAGNOSTIC_QUIZ_ID, {
  id: DIAGNOSTIC_QUIZ_ID,
  topicId: null,
  kind: 'Diagnostic',
  title: { en: 'Five-question check-up', ar: 'اختبار تحديد المستوى (٥ أسئلة)' },
  questionCount: DIAGNOSTIC_QUESTION_IDS.length,
  estimatedMinutes: 5,
  questionIds: DIAGNOSTIC_QUESTION_IDS,
});

export function publicOptions(q: StoredQuestion): QuizOptionDto[] {
  return q.options.map((o) => ({ id: o.id, text: o.text }));
}
