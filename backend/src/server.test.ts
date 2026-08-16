import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

describe('server API', () => {
  let tempDir: string;
  let app: Awaited<ReturnType<typeof import('./server.js').createApp>>;

  beforeAll(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'weather-starter-server-test-'));
    process.env.DATABASE_PATH = join(tempDir, 'weather.db');
    process.env.LOG_LEVEL = 'silent';

    const { createApp } = await import('./server.js');
    app = await createApp({
      serveFrontend: false,
      enableRequestLogging: false,
    });
  });

  afterAll(async () => {
    try {
      const { closeDatabase } = await import('./db.js');
      closeDatabase();
    } catch (_err) {
      // ignore
    }
    await rm(tempDir, { recursive: true, force: true });
  });

  it('reports health status', async () => {
    const response = await request(app).get('/health').expect(200);

    expect(response.body).toEqual({ status: 'healthy' });
  });

  it('accepts frontend interaction logs with valid event names', async () => {
    await request(app)
      .post('/api/logs')
      .send({
        event: 'forecast.refresh',
        metadata: { locationId: 1 },
        page: '/locations',
      })
      .expect(204);
  });

  it('rejects frontend interaction logs with invalid event names', async () => {
    const response = await request(app)
      .post('/api/logs')
      .send({ event: 'Bad Event Name' })
      .expect(422);

    expect(response.body).toEqual({ detail: 'event is required' });
  });
});
