# Codex Handoff Instructions

## Goal
Build the Money Flow local web app using the provided planning docs.

Prioritize a working local MVP with clean architecture over visual perfection.

## Hard Requirements
- One repo.
- `fe/` and `be/` directories.
- One root command starts FE, BE, migrations, and local DB setup.
- Use TypeScript everywhere.
- Use Vite React frontend.
- Use Fastify backend.
- Use SQLite with Drizzle.
- Use `@tcn/state` for frontend domain and presenter state.
- Business logic belongs in domains.
- React components must stay dumb.
- Backend domains must not depend on Fastify or SQLite.
- Store raw CSV files locally.
- Store parsed transactions in SQLite.
- Support arbitrary CSV column mapping.
- Deduplicate transactions.
- Apply category rules to future uploads.
- Support light and dark theme.

## Suggested Build Order
1. Create monorepo skeleton.
2. Add FE and BE TypeScript configs.
3. Add root dev command.
4. Implement backend DB schema and migration runner.
5. Implement account CRUD backend and frontend.
6. Implement CSV upload storage and header/sample parsing.
7. Implement column mapping preview.
8. Implement transaction normalization and dedupe.
9. Implement import confirmation.
10. Implement category and category rule CRUD.
11. Apply rules during preview/import.
12. Implement dashboard aggregation endpoint.
13. Implement dashboard frontend with initial widgets.
14. Implement dashboard persistence.
15. Add delete upload and delete month.
16. Add tests.
17. Polish theme and loading states.

## Coding Style
Follow these preferences:
- Prefer function expressions over function declarations.
- No semicolons.
- Use tabs.
- Use single quotes.
- Use descriptive TypeScript type names.
- Prefer `thing ? value : null` over `thing && value` in JSX.
- Keep files focused and small.
- Avoid one-letter generic names.

## Prettier Preference
```json
{
	"semi": false,
	"useTabs": true,
	"singleQuote": true
}
```

## Frontend State Pattern
Domains own state using `@tcn/state`.

Presenters subscribe to domain state and expose UI-specific view models.

Views consume presenter state with `useSignalValue` and `useRunnerValue`.

Do not introduce Zustand, Redux, MobX, or React Context for feature state unless explicitly requested later.

## Definition of Done for MVP
- User can create account.
- User can upload CSV.
- User can map arbitrary CSV columns.
- User can preview parsed transactions.
- User can import transactions.
- Duplicate transactions are skipped.
- User can create categories and rules.
- Rules auto-apply to future uploads.
- User can view dashboard by month, year, and all-time.
- User can toggle positive outflows as income.
- User can delete a bad upload or month.
- Data persists after restart.
- Tests cover core business rules.
