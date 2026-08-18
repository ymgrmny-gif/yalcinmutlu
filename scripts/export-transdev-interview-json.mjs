import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const sourceDir = path.join(root, 'data', 'transdev-interview');
const output = path.join(root, 'data', 'transdevInterviewQuestions.json');

const files = Array.from({ length: 6 }, (_, i) => `part-${String(i + 1).padStart(2, '0')}.json`);
const chunks = await Promise.all(
  files.map(async (name) => JSON.parse(await readFile(path.join(sourceDir, name), 'utf8')))
);
const questions = chunks.flat();

if (questions.length !== 150) throw new Error(`Expected 150 questions, got ${questions.length}`);
const ids = new Set(questions.map((q) => q.id));
if (ids.size !== questions.length) throw new Error('Duplicate question ids found');

for (const q of questions) {
  for (const field of ['id', 'keywords', 'ceviri', 'cevap', 'anlami']) {
    if (!q[field] || (Array.isArray(q[field]) && q[field].length === 0)) {
      throw new Error(`Missing ${field} on ${q.id}`);
    }
  }
}

await writeFile(output, `${JSON.stringify(questions, null, 2)}\n`, 'utf8');
console.log(`Wrote ${questions.length} questions to ${path.relative(root, output)}`);
