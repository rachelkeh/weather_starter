# Singapore Weather API Notes

Base URL: https://api-open.data.gov.sg

## 2-Hour Forecast

- Endpoint: `/v2/real-time/api/two-hr-forecast`
- Area-based forecast grouped by named areas
- Response includes area metadata and per-area conditions

## Realtime Station Readings

- `/v2/real-time/api/air-temperature`
- `/v2/real-time/api/relative-humidity`
- `/v2/real-time/api/rainfall`
- `/v2/real-time/api/wind-speed`
- `/v2/real-time/api/wind-direction`

## Extended Forecasts

- `/v1/environment/24-hour-weather-forecast`
- `/v1/environment/4-day-weather-forecast`

## Usage Notes

- Keep provider-specific parsing in `backend/src/weather.ts`.
- Normalize responses before persistence.
- Keep the snapshot-based model in the app backend.

