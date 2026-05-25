# Clean Code Rules for Codex

Follow these rules when writing or editing code.

## Core principles

- Optimize for readability.
- Make code easy to change.
- Keep functions small and focused.
- Keep names precise.
- Avoid cleverness.
- Prefer explicit dependencies.
- Make invalid states hard to represent.
- Separate business logic from framework code.

## Naming

Use names that reveal intent.

Prefer:

```ts
const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active')
```

Avoid:

```ts
const data = items.filter(x => x.s === 'active')
```

Use domain language.

Prefer:

```ts
CampaignRepositoryPort
CampaignDraft
CreateCampaignUseCase
```

Avoid:

```ts
DataService
Manager
Helper
Util
Thing
```

## Functions

A function should do one thing.

Prefer:

```ts
const getActiveCampaigns = (campaigns: Campaign[]): Campaign[] => {
	return campaigns.filter(campaign => campaign.status === 'active')
}
```

Avoid functions that:

- validate
- mutate
- call APIs
- update UI
- format results

all in one place.

## Conditionals

Prefer readable branching.

Use early returns to reduce nesting.

Prefer:

```ts
if (!campaign) {
	return null
}

if (!campaign.canEdit) {
	return null
}

return <CampaignEditor campaign={campaign} />
```

Avoid deeply nested logic.

In JSX, prefer:

```tsx
{thing ? <Thing /> : null}
```

over:

```tsx
{thing && <Thing />}
```

## Types

Use descriptive TypeScript types.

Prefer:

```ts
type CampaignFormState = {
	name: string
	channel: CampaignChannel
	moduleType: CampaignModuleType
}
```

Avoid vague types:

```ts
type Data = Record<string, unknown>
```

Use `unknown` instead of `any` unless there is a strong reason.

Avoid one-letter generic names unless the type is truly obvious and local.

Prefer:

```ts
type Result<ValueType, ErrorType> = ...
```

over:

```ts
type Result<T, E> = ...
```

## Classes

Use classes when they clarify domain behavior, lifecycle, or encapsulated state.

Good uses:

- domain models with behavior
- presenters with subscriptions/lifecycle
- adapters implementing ports

Avoid classes that are just static utility bags.

## State

Keep state close to where it belongs.

- domain state belongs in the domain
- UI-facing derived state belongs in presenters
- visual state can live in views when purely visual
- server/cache state belongs behind adapters or query layers

Avoid duplicating the same state in multiple layers.

## Side effects

Push side effects to boundaries.

Side effects include:

- API calls
- localStorage/sessionStorage
- timers
- subscriptions
- DOM access
- analytics
- navigation

Domain logic should receive side-effect dependencies through ports.

## Errors

Use explicit error types where helpful.

Prefer:

```ts
type CreateCampaignError =
	| { type: 'missing-name' }
	| { type: 'invalid-channel' }
	| { type: 'network-error'; message: string }
```

Avoid throwing generic strings.

Normalize adapter errors before they reach the domain or presenter.

## Tests

Test behavior, not implementation details.

Prioritize:

1. domain tests
2. presenter tests
3. adapter mapping/error tests
4. view tests for meaningful interactions

Avoid tests that only lock in markup without business value.

## Comments

Use comments to explain why, not what.

Good:

```ts
// The API returns archived campaigns by default, so filter here until the backend supports the flag.
```

Bad:

```ts
// Loop over campaigns.
```

## Refactoring rules

When refactoring:

1. keep behavior unchanged
2. add tests first if behavior is risky
3. make small commits/changes
4. avoid unrelated formatting churn
5. preserve public APIs unless asked to change them

## Done means

A task is done when:

- behavior is implemented
- relevant tests are added or updated
- typecheck passes, if available
- lint/format passes, if available
- build passes, if relevant
- changed files are summarized
- remaining risks are called out
