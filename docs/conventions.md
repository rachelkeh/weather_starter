# TypeScript and Implementation Conventions

## Language and Module Style

- The codebase uses TypeScript and ES modules.
- Prefer small, explicit helper functions over hidden behavior.
- Keep data normalization in the backend rather than in UI components when the data comes from external APIs.

## Backend Conventions

- Validate request payloads at the route boundary.
- Return clear HTTP statuses for validation errors, missing records, conflicts, and provider failures.
- Preserve the snapshot model when changing weather refresh behavior.
- Keep database writes inside `backend/src/db.ts` or a nearby persistence helper.

## Frontend Conventions

- Keep `/api` requests relative so the app works without separate frontend/backend port configuration.
- Use `frontend/src/state/store.tsx` as the shared orchestration layer for loading, selection, refresh, create, and delete flows.
- Keep presentational components in `frontend/src/components/`.

## Weather Client Conventions

- Treat the Singapore weather APIs as the source of truth for current conditions and forecast snapshots.
- Normalize external response shapes before storing them in the app.
- Keep API-specific parsing in `backend/src/weather.ts`.

## Obvious or Low-Value Notes

- “Write clean code” is too vague to be actionable and does not belong here.
- “Use TypeScript” is already obvious from the repo structure.
- “Prefer readable code” is too general unless paired with a specific rule.
