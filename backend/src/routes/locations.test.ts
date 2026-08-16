import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { WeatherSnapshot } from '../weather.js';

const weather: WeatherSnapshot = {
  condition: 'Cloudy',
  observed_at: '2026-05-04T00:00:00Z',
  source: 'test',
  area: 'Bishan',
  valid_period_text: 'Now',
  temperature_c: 29,
  humidity_percent: 80,
  rainfall_mm: 0,
  wind_speed_knots: 4,
  wind_direction_degrees: 180,
  forecast_low_c: 25,
  forecast_high_c: 32,
  uv_index: 7,
  psi_twenty_four_hourly: 42,
  pm25_one_hourly: 9,
  air_quality_region: 'central',
  forecast_periods: [{ label: 'Now', forecast: 'Cloudy' }],
  daily_forecast: [
    { date: '2026-05-04', forecast: 'Cloudy', temperature_low_c: 25, temperature_high_c: 32 },
  ],
};

describe('locations API', () => {
  let tempDir: string;
  let app: Awaited<ReturnType<typeof import('../server.js').createApp>>;

  beforeAll(async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'weather-starter-test-'));
    process.env.DATABASE_PATH = join(tempDir, 'weather.db');
    process.env.LOG_LEVEL = 'silent';

    const { createApp } = await import('../server.js');
    app = await createApp({
      serveFrontend: false,
      enableRequestLogging: false,
      weatherClient: {
        async getCurrentWeather() {
          return weather;
        },
      },
    });
  });

  afterAll(async () => {
    // Close the database to ensure SQLite temporary files can be removed on Windows
    try {
      const { closeDatabase } = await import('../db.js');
      closeDatabase();
    } catch (_err) {
      // ignore
    }
    await rm(tempDir, { recursive: true, force: true });
  });

  it('refreshes weather when a location is created', async () => {
    const response = await request(app)
      .post('/api/locations')
      .send({ latitude: 1.35, longitude: 103.85 })
      .expect(201);

    expect(response.body).toMatchObject({
      id: 1,
      latitude: 1.35,
      longitude: 103.85,
      weather: {
        condition: 'Cloudy',
        area: 'Bishan',
        temperature_c: 29,
        humidity_percent: 80,
        rainfall_mm: 0,
        wind_speed_knots: 4,
        wind_direction_degrees: 180,
        uv_index: 7,
      },
    });

    const listResponse = await request(app).get('/api/locations').expect(200);
    expect(listResponse.body.locations).toHaveLength(1);
    expect(listResponse.body.locations[0].weather.condition).toBe('Cloudy');
  });

  it('creates a detected location through the location API', async () => {
    const response = await request(app)
      .post('/api/locations/detect')
      .send({ latitude: 1.37, longitude: 103.87 })
      .expect(201);

    expect(response.body).toMatchObject({
      reused: false,
      location: {
        latitude: 1.37,
        longitude: 103.87,
        weather: {
          condition: 'Cloudy',
          area: 'Bishan',
        },
      },
    });
  });

  it('rejects detected coordinates outside Singapore', async () => {
    const response = await request(app)
      .post('/api/locations/detect')
      .send({ latitude: 1.6, longitude: 103.87 })
      .expect(422);

    expect(response.body.detail).toContain('Coordinates must be within Singapore');
  });

  it('selects an existing nearby location for detected coordinates', async () => {
    const created = await request(app)
      .post('/api/locations/detect')
      .send({ latitude: 1.38, longitude: 103.88 })
      .expect(201);

    const reused = await request(app)
      .post('/api/locations/detect')
      .send({ latitude: 1.3805, longitude: 103.8805 })
      .expect(200);

    expect(reused.body).toMatchObject({
      reused: true,
      location: {
        id: created.body.location.id,
        latitude: 1.38,
        longitude: 103.88,
      },
    });

    const listResponse = await request(app).get('/api/locations').expect(200);
    const nearbyLocations = listResponse.body.locations.filter(
      (location: { latitude: number }) => location.latitude >= 1.38 && location.latitude < 1.381,
    );
    expect(nearbyLocations).toHaveLength(1);
  });

  it('deletes a location', async () => {
    const response = await request(app)
      .post('/api/locations')
      .send({ latitude: 1.36, longitude: 103.86 })
      .expect(201);

    const locationId = response.body.id;

    await request(app).delete(`/api/locations/${locationId}`).expect(204);

    const listResponse = await request(app).get('/api/locations').expect(200);
    expect(
      listResponse.body.locations.find((location: { id: number }) => location.id === locationId),
    ).toBeUndefined();
    expect(listResponse.body.locations.length).toBeGreaterThan(0);
    await request(app).get(`/api/locations/${locationId}`).expect(404);
  });
});
