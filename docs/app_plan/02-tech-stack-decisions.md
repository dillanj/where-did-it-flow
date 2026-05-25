# Tech Stack Decisions

## Backend Framework: Fastify
Use Fastify for the local API.

Fastify is a Node.js web framework focused on low overhead and performance. It has TypeScript support and route schema support, which is useful for request/response validation.

### Why Fastify Over Express
- Better TypeScript ergonomics.
- Better route schema story.
- Good performance by default.
- Plugin system is clean.
- Still simple enough for a local app.

## Database: SQLite
Use SQLite for the MVP.

SQLite is a strong fit because this is a local-first app with a single user and durable local data. It gives real SQL querying, fast reads, easy backups, and simple persistence without running a separate database server.

### Why SQLite Fits
- No external DB process needed.
- Great for local apps.
- Easy to store in `be/data/money-flow.sqlite`.
- Good enough for years of personal transaction data.
- Easy to migrate later to Postgres if the app becomes a hosted service.

## ORM / Query Layer: Drizzle
Use Drizzle ORM with SQLite and `better-sqlite3`.

An ORM is a TypeScript-friendly layer between app code and SQL. It lets us define schema in code, run migrations, and write typed queries without fully giving up SQL-shaped thinking.

### Why Drizzle Over Prisma
Drizzle is the better fit here because:
- It is lighter weight.
- It stays closer to SQL.
- It fits clean architecture well because repositories can stay explicit.
- It is less magical than Prisma.
- It works well with SQLite and TypeScript.

Prisma is also good, especially for rapid CRUD-heavy apps, but it adds more generated-client machinery. For this app, Drizzle keeps the backend closer to explicit SQL and easier to reason about.

## Charting Library: visx
Use `visx` as the primary charting toolkit.

`visx` is a lower-level React visualization toolkit built around D3 primitives. It is more work than Recharts, but it gives better control and can keep the dashboard custom, fast, and visually polished without pulling in a massive all-in-one chart framework.

### Why visx
- React-native mental model.
- Highly customizable.
- Modular packages.
- Good for polished custom dashboards.
- Lower-level control avoids fighting a big chart abstraction.

### Alternative: uPlot
Use `uPlot` only if we later need extremely high-performance time-series charts with lots of points.

For this app's MVP, the data volume is probably small enough that `visx` is the better balance of performance, design control, and React ergonomics.

## Frontend State: @tcn/state
Use local domain and presenter classes with `@tcn/state`.

Do not add Zustand, Redux, MobX, or React Context for feature state. React should observe presenter state through `useSignalValue` and `useRunnerValue`.

## Package Manager
Use whichever package manager the repo starts with, but prefer `pnpm` or `yarn`. The root should expose one command that starts the backend and frontend together.

Example:

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev -w be\" \"npm run dev -w fe\""
  }
}
```

## Recommended Final Stack
```txt
FE: Vite + React + TypeScript + Tailwind + Vitest + @tcn/state + visx
BE: Node + TypeScript + Fastify + Vitest + Drizzle + SQLite + better-sqlite3
DB: SQLite file in be/data
```
