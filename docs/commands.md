# Commands and Verification

## Install

```bash
npm install
```

## Development

```bash
npm run dev
```

Starts the combined backend and frontend development stack.

## Build

```bash
npm run build
```

Builds the frontend workspace and compiles the backend TypeScript.

## Production Start

```bash
npm run start
```

Runs the compiled backend server.

## Tests

```bash
npm test
```

Runs the backend Vitest suite.

```bash
npm run test:watch
```

Runs the test suite in watch mode.

## Database

```bash
npm run db:generate
```

Generates Drizzle migration SQL after schema changes.

```bash
npm run db:migrate
```

Applies Drizzle migrations to the local SQLite database.

## Utility Scripts

```bash
npm run doctor
```

Checks the health endpoints.

```bash
npm run reset
```

Clears the local SQLite database.

## Linting

There is currently no top-level lint command in `package.json`.
If linting is added later, document the command here and wire it into the root scripts.
