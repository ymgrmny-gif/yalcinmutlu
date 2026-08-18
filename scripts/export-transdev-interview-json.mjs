import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const sourceDir = path.join(root, 'data', 'transdev-interview');
const output = path.join(root, 'data', 'transdevInterviewQuestions.json');

const files = Array.from({ length: 7 }, (_, i) => `part-${String(i + 1).padStart(2, '0')}.json`);
const chunks = await Promise.all(
  files.map(async (name) => JSON.parse(await readFile(path.join(sourceDir, name), 'utf8')))
);
const questions = chunks.flat();

const additions = JSON.parse(
  await readFile(path.join(sourceDir, 'legacy-studydeck-additions.json'), 'utf8')
);

for (const question of questions) {
  const extraKeywords = additions.keywordAdditions?.[question.id] ?? [];
  if (extraKeywords.length) {
    question.keywords = [...new Set([...question.keywords, ...extraKeywords])];
  }

  const overrides = additions.fieldOverrides?.[question.id];
  if (overrides) Object.assign(question, overrides);
}

if (questions.length !== 153) throw new Error(`Expected 153 questions, got ${questions.length}`);
const ids = new Set(questions.map((q) => q.id));
if (ids.size !== questions.length) throw new Error('Duplicate question ids found');

for (const [id, keywords] of Object.entries(additions.keywordAdditions ?? {})) {
  if (!ids.has(id)) throw new Error(`Unknown keyword addition id: ${id}`);
  if (!Array.isArray(keywords) || keywords.length === 0) throw new Error(`Empty keyword addition for ${id}`);
}
for (const id of Object.keys(additions.fieldOverrides ?? {})) {
  if (!ids.has(id)) throw new Error(`Unknown field override id: ${id}`);
}

for (const q of questions) {
  for (const field of ['id', 'keywords', 'ceviri', 'cevap', 'anlami']) {
    if (!q[field] || (Array.isArray(q[field]) && q[field].length === 0)) {
      throw new Error(`Missing ${field} on ${q.id}`);
    }
  }
}

await writeFile(output, `${JSON.stringify(questions, null, 2)}\n`, 'utf8');
console.log(`Wrote ${questions.length} questions to ${path.relative(root, output)}`);
