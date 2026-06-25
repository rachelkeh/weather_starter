import { afterEach, describe, expect, it, vi } from 'vitest';
import { SingaporeWeatherClient } from './weather.js';

function jsonResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    async json() {
      return body;
    },
  } as Response;
}

describe('SingaporeWeatherClient.getCurrentWeather', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('combines two-hour forecast with nearest temperature/humidity/rainfall readings', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith('/v2/real-time/api/two-hr-forecast')) {
        return jsonResponse({
          code: 0,
          data: {
            area_metadata: [
              {
                name: 'Bishan',
                label_location: { latitude: 1.35, longitude: 103.85 },
              },
            ],
            items: [
              {
                update_timestamp: '2026-06-22T09:00:00+08:00',
                valid_period: { text: '9 AM to 11 AM' },
                forecasts: [{ area: 'Bishan', forecast: 'Cloudy' }],
              },
            ],
          },
        });
      }

      if (url.endsWith('/v2/real-time/api/twenty-four-hr-forecast')) {
        return jsonResponse({
          code: 0,
          data: {
            records: [
              {
                updatedTimestamp: '2026-06-22T09:10:00+08:00',
                general: {
                  temperature: {
                    low: 25,
                    high: 32,
                  },
                },
                periods: [
                  {
                    timePeriod: { text: 'Morning' },
                    regions: {
                      central: { text: 'Cloudy' },
                    },
                  },
                ],
              },
            ],
          },
        });
      }

      if (url.endsWith('/v1/environment/4-day-weather-forecast')) {
        return jsonResponse({
          items: [
            {
              update_timestamp: '2026-06-22T09:11:00+08:00',
              forecasts: [
                {
                  date: '2026-06-22',
                  forecast: 'Cloudy',
                  temperature: { low: 25, high: 32 },
                },
                {
                  date: '2026-06-23',
                  forecast: 'Sunny',
                  temperature: { low: 26, high: 33 },
                },
              ],
            },
          ],
        });
      }

      if (url.endsWith('/v2/real-time/api/wind-speed')) {
        return jsonResponse({
          code: 0,
          data: {
            stations: [{ id: 'S1', location: { latitude: 1.35, longitude: 103.85 } }],
            readings: [
              {
                timestamp: '2026-06-22T09:05:00+08:00',
                data: [{ stationId: 'S1', value: 5.2 }],
              },
            ],
          },
        });
      }

      if (url.endsWith('/v2/real-time/api/wind-direction')) {
        return jsonResponse({
          code: 0,
          data: {
            stations: [{ id: 'S1', location: { latitude: 1.35, longitude: 103.85 } }],
            readings: [
              {
                timestamp: '2026-06-22T09:05:00+08:00',
                data: [{ stationId: 'S1', value: 210 }],
              },
            ],
          },
        });
      }

      if (url.endsWith('/v2/real-time/api/uv')) {
        return jsonResponse({
          code: 0,
          data: {
            records: [
              {
                updatedTimestamp: '2026-06-22T09:08:00+08:00',
                index: [{ value: 6.5 }],
              },
            ],
          },
        });
      }

      if (url.endsWith('/v2/real-time/api/psi')) {
        return jsonResponse({
          code: 0,
          data: {
            regionMetadata: [
              {
                name: 'central',
                labelLocation: { latitude: 1.35, longitude: 103.82 },
              },
            ],
            items: [
              {
                updatedTimestamp: '2026-06-22T09:09:00+08:00',
                readings: {
                  psi_twenty_four_hourly: {
                    central: 42,
                  },
                },
              },
            ],
          },
        });
      }

      if (url.endsWith('/v2/real-time/api/pm25')) {
        return jsonResponse({
          code: 0,
          data: {
            items: [
              {
                updatedTimestamp: '2026-06-22T09:09:30+08:00',
                readings: {
                  pm25_one_hourly: {
                    central: 9,
                  },
                },
              },
            ],
          },
        });
      }

      if (url.endsWith('/v2/real-time/api/air-temperature')) {
        return jsonResponse({
          code: 0,
          data: {
            stations: [{ id: 'S1', location: { latitude: 1.35, longitude: 103.85 } }],
            readings: [
              {
                timestamp: '2026-06-22T09:05:00+08:00',
                data: [{ stationId: 'S1', value: 30.2 }],
              },
            ],
          },
        });
      }

      if (url.endsWith('/v2/real-time/api/relative-humidity')) {
        return jsonResponse({
          code: 0,
          data: {
            stations: [{ id: 'S1', location: { latitude: 1.35, longitude: 103.85 } }],
            readings: [
              {
                timestamp: '2026-06-22T09:05:00+08:00',
                data: [{ stationId: 'S1', value: 81 }],
              },
            ],
          },
        });
      }

      if (url.endsWith('/v2/real-time/api/rainfall')) {
        return jsonResponse({
          code: 0,
          data: {
            stations: [{ id: 'S1', location: { latitude: 1.35, longitude: 103.85 } }],
            readings: [
              {
                timestamp: '2026-06-22T09:05:00+08:00',
                data: [{ stationId: 'S1', value: 0.4 }],
              },
            ],
          },
        });
      }

      throw new Error(`Unexpected URL: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);

    const client = new SingaporeWeatherClient();
    const snapshot = await client.getCurrentWeather(1.35, 103.85);

    expect(snapshot).toMatchObject({
      condition: 'Cloudy',
      area: 'Bishan',
      valid_period_text: '9 AM to 11 AM',
      temperature_c: 30.2,
      humidity_percent: 81,
      rainfall_mm: 0.4,
      wind_speed_knots: 5.2,
      wind_direction_degrees: 210,
      uv_index: 6.5,
      psi_twenty_four_hourly: 42,
      pm25_one_hourly: 9,
      air_quality_region: 'central',
      forecast_low_c: 25,
      forecast_high_c: 32,
      forecast_periods: [{ label: 'Morning', forecast: 'Cloudy' }],
      daily_forecast: [
        {
          date: '2026-06-22',
          forecast: 'Cloudy',
          temperature_low_c: 25,
          temperature_high_c: 32,
        },
        {
          date: '2026-06-23',
          forecast: 'Sunny',
          temperature_low_c: 26,
          temperature_high_c: 33,
        },
      ],
    });
    expect(snapshot.observed_at).toBe('2026-06-22T09:11:00+08:00');
    expect(fetchMock).toHaveBeenCalledTimes(11);
  });

  it('keeps forecast data when a reading endpoint fails', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.endsWith('/v2/real-time/api/two-hr-forecast')) {
        return jsonResponse({
          code: 0,
          data: {
            area_metadata: [
              {
                name: 'Bishan',
                label_location: { latitude: 1.35, longitude: 103.85 },
              },
            ],
            items: [
              {
                update_timestamp: '2026-06-22T09:00:00+08:00',
                forecasts: [{ area: 'Bishan', forecast: 'Fair' }],
              },
            ],
          },
        });
      }

      if (url.endsWith('/v2/real-time/api/twenty-four-hr-forecast')) {
        throw new Error('forecast unavailable');
      }

      if (url.endsWith('/v1/environment/4-day-weather-forecast')) {
        throw new Error('4-day forecast unavailable');
      }

      if (url.endsWith('/v2/real-time/api/wind-speed')) {
        throw new Error('wind data unavailable');
      }

      if (url.endsWith('/v2/real-time/api/wind-direction')) {
        throw new Error('wind data unavailable');
      }

      if (url.endsWith('/v2/real-time/api/uv')) {
        throw new Error('uv unavailable');
      }

      if (url.endsWith('/v2/real-time/api/psi')) {
        throw new Error('psi unavailable');
      }

      if (url.endsWith('/v2/real-time/api/pm25')) {
        throw new Error('pm25 unavailable');
      }

      if (url.endsWith('/v2/real-time/api/air-temperature')) {
        return jsonResponse({
          code: 0,
          data: {
            stations: [{ id: 'S1', location: { latitude: 1.35, longitude: 103.85 } }],
            readings: [
              {
                timestamp: '2026-06-22T09:03:00+08:00',
                data: [{ stationId: 'S1', value: 29 }],
              },
            ],
          },
        });
      }

      if (url.endsWith('/v2/real-time/api/relative-humidity')) {
        throw new Error('network down');
      }

      if (url.endsWith('/v2/real-time/api/rainfall')) {
        return jsonResponse({
          code: 0,
          data: {
            stations: [],
            readings: [],
          },
        });
      }

      throw new Error(`Unexpected URL: ${url}`);
    });

    vi.stubGlobal('fetch', fetchMock);

    const client = new SingaporeWeatherClient();
    const snapshot = await client.getCurrentWeather(1.35, 103.85);

    expect(snapshot.condition).toBe('Fair');
    expect(snapshot.temperature_c).toBe(29);
    expect(snapshot.humidity_percent).toBeNull();
    expect(snapshot.rainfall_mm).toBeNull();
    expect(snapshot.wind_speed_knots).toBeNull();
    expect(snapshot.wind_direction_degrees).toBeNull();
    expect(snapshot.uv_index).toBeNull();
    expect(snapshot.psi_twenty_four_hourly).toBeNull();
    expect(snapshot.pm25_one_hourly).toBeNull();
    expect(snapshot.air_quality_region).toBeNull();
    expect(snapshot.forecast_low_c).toBeNull();
    expect(snapshot.forecast_high_c).toBeNull();
    expect(snapshot.daily_forecast).toEqual([]);
  });
});

