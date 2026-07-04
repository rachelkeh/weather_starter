# API and Data Flow

## Primary Endpoints

- `GET /health` returns a simple health status.
- `GET /api/locations` lists saved locations.
- `POST /api/locations` creates a new location.
- `GET /api/locations/:id` reads one location.
- `POST /api/locations/:id/refresh` refreshes weather for a saved location.
- `DELETE /api/locations/:id` deletes a saved location.

## Data Flow

1. A location is created with coordinates.
2. The backend immediately fetches the latest weather snapshot from the Singapore weather APIs.
3. The snapshot is stored with the location in SQLite.
4. Refreshing a location repeats the fetch-and-store flow.
5. The frontend reads state from `/api/locations` and keeps the selected location in client state.

## External Weather APIs

- `backend/src/weather.ts` talks to the Singapore data.gov.sg weather APIs.
- Forecast and station-reading responses are normalized into the app’s `WeatherSnapshot` shape before persistence.
- Nearby station and area matching is done in the backend.

## Testing

- Backend tests live under `backend/src/**/*.test.ts`.
- Route and service behavior should be covered at the backend layer first.
