# New Feature Flow for Codex

Use this workflow when starting a new feature.

## Goal

Keep Codex focused, reduce random edits, and make implementation traceable from plan to issue to code.

## Phase 1: Understand

Before coding, gather context.

Codex should inspect:

- existing feature structure
- similar features
- domain patterns
- presenter patterns
- adapter patterns
- test patterns
- package scripts
- routing conventions
- shared UI conventions

Codex should ask questions when answers materially affect architecture.

Good questions:

- What are the supported user flows?
- What data comes from the API?
- What state belongs in the domain vs presenter?
- What is the minimum MVP?
- What edge cases matter now?
- What should be intentionally out of scope?

## Phase 2: Plan

Create a thorough plan before implementation.

The plan should include:

```md
# Feature Plan: <feature name>

## Goal

## Assumptions

## Open questions

## User flows

## Architecture

### Domain

### Presenter

### Adapter

### View/components

## Files to create

## Files to edit

## Files to avoid touching

## Data model/types

## Tests

## Verification commands

## Risks

## Task breakdown
```

## Phase 3: Create an epic

Create an epic or equivalent GitHub tracking issue to organize the work.

If GitHub does not support epics in the repo, create a parent issue.

Suggested parent issue format:

```md
# Epic: <feature name>

## Goal

## Scope

## Out of scope

## User flows

## Architecture summary

## Child issues

- [ ] <issue 1>
- [ ] <issue 2>
- [ ] <issue 3>

## Definition of done

- [ ] Domain logic implemented
- [ ] Presenter implemented
- [ ] Adapters implemented
- [ ] Views/components implemented
- [ ] Unit tests added
- [ ] Typecheck passes
- [ ] Lint passes
- [ ] Build passes
```

## Phase 4: Create implementation issues

Break the plan into focused issues.

Prefer small, reviewable issues.

Good issue boundaries:

1. domain model and use cases
2. adapter implementation
3. presenter implementation
4. UI/views/components
5. tests and integration
6. cleanup/docs

Each issue should include:

```md
# <Issue title>

## Goal

## Scope

## Files likely to touch

## Files not to touch

## Implementation notes

## Tests

## Verification

## Done when
```

## Phase 5: Implement one issue at a time

Before coding an issue, Codex should restate:

- selected issue
- files it expects to touch
- files it will avoid
- verification commands
- known risks

During implementation:

- make the smallest safe change
- preserve existing patterns
- avoid broad rewrites
- keep business logic in domain
- keep views presentational
- keep adapters isolated
- write tests close to the changed behavior

## Phase 6: Verification

Run the narrowest useful checks first, then broader checks.

Suggested order:

```bash
pnpm test <relevant-test>
pnpm typecheck
pnpm lint
pnpm build
```

Use the project’s actual commands.

Do not invent scripts.

If commands are missing, inspect `package.json`.

If verification cannot run, state why.

## Phase 7: Final summary

Codex should finish with:

```md
## Summary

- <change 1>
- <change 2>
- <change 3>

## Files changed

- `<path>`: <why>

## Verification

- `<command>`: passed
- `<command>`: failed because <reason>
- not run: <reason>

## Notes / risks

- <risk or follow-up>
```

## Guardrails

Do not:

- touch unrelated files
- rewrite architecture without approval
- move files unless the task requires it
- add new dependencies without explaining why
- hide business logic in React components
- call APIs directly from views
- skip tests for domain behavior
- claim verification passed without running it

## Prompt template for starting a feature

Use this prompt with Codex:

```md
Use the project `AGENTS.md` and `docs/codex/new-feature-flow.md`.

I want to build: <feature description>.

Start by inspecting the repo and creating a plan only. Do not edit code yet.

Your plan must include:
- assumptions
- open questions
- files likely to touch
- files to avoid touching
- domain/presenter/adapter/view breakdown
- testing strategy
- verification commands
- GitHub epic/parent issue draft
- child issue drafts
```

## Prompt template for implementing an issue

```md
Use the project `AGENTS.md`.

Implement only this issue: <issue link or issue text>.

Before editing, summarize:
- files you expect to touch
- files you will avoid
- tests you will add/update
- verification commands

Then implement the smallest safe change.
```
