import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { WeatherProviderError, type WeatherSnapshot } from '../weather.js';

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
  let currentWeather: WeatherSnapshot;
  let currentWeatherError: Error | null;

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
          if (currentWeatherError) throw currentWeatherError;
          return currentWeather;
        },
      },
    });
  });

  beforeEach(async () => {
    currentWeather = weather;
    currentWeatherError = null;
    const { resetStore } = await import('../db.js');
    await resetStore();
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
    expect(listResponse.body.locations).toHaveLength(0);
    await request(app).get(`/api/locations/${locationId}`).expect(404);
  });

  it('rejects invalid coordinates when a location is created', async () => {
    const missing = await request(app).post('/api/locations').send({ latitude: 1.35 }).expect(422);
    expect(missing.body.detail).toBe('latitude and longitude are required');

    const outsideSingapore = await request(app)
      .post('/api/locations')
      .send({ latitude: 1.35, longitude: 104.5 })
      .expect(422);
    expect(outsideSingapore.body.detail).toContain('Coordinates must be within Singapore');

    const listResponse = await request(app).get('/api/locations').expect(200);
    expect(listResponse.body.locations).toHaveLength(0);
  });

  it('rejects exact duplicate locations', async () => {
    await request(app)
      .post('/api/locations')
      .send({ latitude: 1.35, longitude: 103.85 })
      .expect(201);

    const duplicate = await request(app)
      .post('/api/locations')
      .send({ latitude: 1.35, longitude: 103.85 })
      .expect(409);

    expect(duplicate.body.detail).toBe('Location already exists');
  });

  it('reads one location by id', async () => {
    const created = await request(app)
      .post('/api/locations')
      .send({ latitude: 1.34, longitude: 103.84 })
      .expect(201);

    const response = await request(app).get(`/api/locations/${created.body.id}`).expect(200);
    expect(response.body).toMatchObject({
      id: created.body.id,
      latitude: 1.34,
      longitude: 103.84,
      weather: {
        condition: 'Cloudy',
        area: 'Bishan',
      },
    });
  });

  it('refreshes weather for an existing location', async () => {
    const created = await request(app)
      .post('/api/locations')
      .send({ latitude: 1.35, longitude: 103.85 })
      .expect(201);

    currentWeather = {
      ...weather,
      condition: 'Fair',
      observed_at: '2026-05-04T01:00:00Z',
      area: 'Toa Payoh',
      temperature_c: 31,
    };

    const refreshed = await request(app)
      .post(`/api/locations/${created.body.id}/refresh`)
      .expect(200);

    expect(refreshed.body).toMatchObject({
      id: created.body.id,
      weather: {
        condition: 'Fair',
        area: 'Toa Payoh',
        temperature_c: 31,
      },
    });

    const fetched = await request(app).get(`/api/locations/${created.body.id}`).expect(200);
    expect(fetched.body.weather.condition).toBe('Fair');
  });

  it('returns 404 for missing location read, refresh, and delete requests', async () => {
    await request(app).get('/api/locations/999').expect(404);
    await request(app).post('/api/locations/999/refresh').expect(404);
    await request(app).delete('/api/locations/999').expect(404);
  });

  it('keeps the created location when the initial weather refresh fails', async () => {
    currentWeatherError = new WeatherProviderError('Weather provider temporarily unavailable');

    const response = await request(app)
      .post('/api/locations')
      .send({ latitude: 1.35, longitude: 103.85 })
      .expect(201);

    expect(response.body).toMatchObject({
      latitude: 1.35,
      longitude: 103.85,
      weather: {
        condition: 'Not refreshed',
        source: 'not-refreshed',
      },
    });
  });

  it('returns 502 when refresh fails after a location already exists', async () => {
    const created = await request(app)
      .post('/api/locations')
      .send({ latitude: 1.35, longitude: 103.85 })
      .expect(201);

    currentWeatherError = new WeatherProviderError('Weather provider temporarily unavailable');

    const response = await request(app)
      .post(`/api/locations/${created.body.id}/refresh`)
      .expect(502);

    expect(response.body.detail).toBe('Weather provider temporarily unavailable');
  });
});
