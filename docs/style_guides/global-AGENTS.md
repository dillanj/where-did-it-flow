# Global Codex Instructions

These are my personal defaults. Follow them unless a project-level `AGENTS.md` says otherwise.

## Communication

- Be concise.
- Prefer direct answers and concrete examples.
- Ask clarifying questions when requirements are ambiguous and the answer would materially change the implementation.
- When working in a repo, inspect the existing conventions before making changes.
- Do not rewrite large unrelated areas just to make code prettier.

## Coding style

- Prefer TypeScript.
- Prefer function expressions over function declarations.
- Prefer clean, descriptive names over abbreviations.
- Avoid one-letter type names.
- Prefer readable code over clever code.
- Prefer small functions with one clear responsibility.
- Prefer early returns over deeply nested conditionals.
- Prefer explicit conditionals in JSX: `thing ? <Component /> : null` instead of `thing && <Component />`.

## Formatting preferences

Use these preferences unless the project config says otherwise:

```json
{
	"semi": false,
	"useTabs": true,
	"singleQuote": true
}
```

Project formatter config always wins.

## Working rules

Before editing:

1. Understand the task.
2. Identify the smallest safe change.
3. Inspect nearby code for patterns.
4. Name the files you expect to touch.
5. Avoid touching files outside the task unless needed.

While editing:

1. Keep domain/business logic out of views/components.
2. Keep UI components mostly presentational.
3. Keep side effects at boundaries.
4. Avoid hidden coupling.
5. Do not introduce broad abstractions before the second or third concrete use case.

Before finishing:

1. Run relevant tests, type checks, lint, or formatting when available.
2. Add or update unit tests when behavior changes.
3. Summarize what changed.
4. Mention verification commands and results.
5. Call out anything not verified.

## Design preference

When applicable, prefer a domain/presenter/adapter/view split:

- domain: core business logic and state transitions
- presenter: UI-facing state and commands
- adapter: external services, APIs, storage, SDKs
- view/component: rendering only

Domain code should be able to run headlessly without React.
