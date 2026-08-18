import part01 from '@/data/transdev-interview/part-01.json';
import part02 from '@/data/transdev-interview/part-02.json';
import part03 from '@/data/transdev-interview/part-03.json';
import part04 from '@/data/transdev-interview/part-04.json';
import part05 from '@/data/transdev-interview/part-05.json';
import part06 from '@/data/transdev-interview/part-06.json';
import part07 from '@/data/transdev-interview/part-07.json';
import part08 from '@/data/transdev-interview/part-08.json';
import legacyAdditions from '@/data/transdev-interview/legacy-studydeck-additions.json';
import videoImportant from '@/data/transdev-interview/video-important-questions.json';

export type Question = {
  id: string;
  keywords: string[];
  ceviri: string;
  cevap: string;
  anlami: string;
  intent_concepts?: string[];
  intent_synonyms?: string[];
};

type RawQuestion = Omit<Question, 'keywords'> & { keywords: string[] | Record<string, number> };
type LegacyAdditions = { keywordAdditions: Record<string, string[]>; fieldOverrides: Record<string, Partial<Pick<Question, 'cevap' | 'anlami'>>>; };
type VideoImportant = { source: string; importantIds: string[]; };

const sourceQuestions = [
  ...(part01 as RawQuestion[]), ...(part02 as RawQuestion[]), ...(part03 as RawQuestion[]),
  ...(part04 as RawQuestion[]), ...(part05 as RawQuestion[]), ...(part06 as RawQuestion[]),
  ...(part07 as RawQuestion[]), ...(part08 as RawQuestion[]),
];

const legacy = legacyAdditions as LegacyAdditions;
export const importantOrder = (videoImportant as VideoImportant).importantIds;
export const importantIds = new Set(importantOrder);

export const questions: Question[] = sourceQuestions.map((question) => {
  const baseKeywords = Array.isArray(question.keywords) ? question.keywords : Object.keys(question.keywords);
  const extraKeywords = legacy.keywordAdditions[question.id] ?? [];
  const override = legacy.fieldOverrides[question.id] ?? {};
  return { ...question, ...override, keywords: Array.from(new Set([...extraKeywords, ...baseKeywords])) };
});

export const orderedQuestions: Question[] = [
  ...importantOrder.map((id) => questions.find((question) => question.id === id)).filter((question): question is Question => Boolean(question)),
  ...questions.filter((question) => !importantIds.has(question.id)),
];
export const importantQuestions = orderedQuestions.filter((question) => importantIds.has(question.id));

export function displayQuestion(question: Question) {
  const raw = question.keywords[0]?.trim() || question.ceviri;
  const sentence = raw.charAt(0).toLocaleUpperCase('de-DE') + raw.slice(1);
  return /[?.!]$/.test(sentence) ? sentence : `${sentence}?`;
}

const passengerIds = new Set(['soru_08','soru_09','soru_10','soru_11','soru_13','soru_14','soru_15','soru_16','soru_17','soru_18','soru_51','soru_54','soru_56','soru_57','soru_58','soru_65','soru_66','soru_67','soru_68','soru_78','ek_154','ek_155']);
const languageIds = new Set(['soru_25','soru_26','soru_76','soru_78','soru_80','soru_81','ek_131','ek_132','ek_133','ek_134','ek_135']);
const conditionIds = new Set(['soru_19','soru_31','soru_32','soru_33','soru_69','soru_70','soru_71','soru_79','ek_126','ek_127','ek_128','ek_129','ek_130','ek_154','ek_155','ek_156']);
const candidateIds = new Set(['soru_35','soru_82']);
export type FilterKey = 'all' | 'important' | 'passenger' | 'language' | 'conditions' | 'candidate';

export function matchesFilter(question: Question, filter: FilterKey) {
  if (filter === 'all') return true;
  if (filter === 'important') return importantIds.has(question.id);
  if (filter === 'passenger') return passengerIds.has(question.id) || question.keywords.some((keyword) => keyword.includes('fahrgast'));
  if (filter === 'language') return languageIds.has(question.id);
  if (filter === 'conditions') return conditionIds.has(question.id);
  return candidateIds.has(question.id);
}

export function searchText(question: Question) {
  return [displayQuestion(question), question.ceviri, question.cevap, question.anlami, ...question.keywords, ...(question.intent_concepts ?? []), ...(question.intent_synonyms ?? [])].join(' ').toLocaleLowerCase('de-DE');
}
