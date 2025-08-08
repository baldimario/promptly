import { expect, test } from 'vitest';

// E2E: hit the running Next.js server inside the container
test('GET /api/health responds with ok', async () => {
  const res = await fetch('http://localhost:3000/api/health');
  expect(res.status).toBe(200);
  const json = (await res.json()) as { status: string; database: string };
  expect(json.status).toBe('ok');
  expect(json.database).toBe('connected');
});
