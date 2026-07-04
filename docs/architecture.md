# Project Architecture

## System Shape

- `backend/` is the API and data layer.
- `frontend/` is the React dashboard.
- The root `npm run dev` script starts the combined local development experience.
- The backend serves `/api/*` and, in development, mounts Vite middleware for the frontend.
- In production, the backend serves the built frontend from `frontend/dist`.

## Backend

- `backend/src/server.ts` creates the Express app and wires middleware, health checks, logging, and routes.
- `backend/src/routes/locations.ts` contains the location API endpoints.
- `backend/src/db.ts` owns SQLite access, Drizzle integration, and record mapping.
- `backend/src/weather.ts` normalizes responses from Singapore weather APIs into a `WeatherSnapshot`.
- `backend/src/schema.ts` defines the Drizzle table schema.
- `backend/src/logger.ts` centralizes structured logging.

## Frontend

- `frontend/src/main.tsx` boots the React app.
- `frontend/src/App.tsx` provides the top-level provider tree.
- `frontend/src/state/store.tsx` holds shared client state and API mutation flows.
- `frontend/src/api.ts` is the frontend API client.
- `frontend/src/components/` contains the UI, including sidebar, hero, map, forms, and forecast display components.

## Data Model

- A location stores latitude, longitude, and a normalized weather snapshot.
- Create and refresh flows fetch the latest weather snapshot and store it on the location record.
- The app is snapshot-based, not history-based.

## Runtime Notes

- The local database defaults to `backend/weather.db` unless `DATABASE_PATH` is set.
- `WEATHER_API_KEY` is optional.
- Tests run in Node via Vitest.
