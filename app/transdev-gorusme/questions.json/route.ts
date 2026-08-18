import { questions } from '../dashboard/data';

export const dynamic = 'force-static';

export function GET() {
  return new Response(`${JSON.stringify(questions, null, 2)}\n`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': 'attachment; filename="transdevInterviewQuestions-153.json"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
