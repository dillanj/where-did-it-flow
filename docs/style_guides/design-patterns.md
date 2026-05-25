# Design Patterns Reference

Use this as a quick guide when choosing a design pattern. Do not force a pattern where a simple function or object would be clearer.

## Creational patterns

### Factory Method

Use when object creation depends on runtime conditions.

Good for:

- choosing a presenter by campaign type
- creating adapters by environment
- constructing validators by form type

Avoid when there is only one concrete type.

### Abstract Factory

Use when creating families of related objects that must work together.

Good for:

- platform-specific UI/service bundles
- test vs production dependency families
- API adapter + mapper + error normalizer sets

Avoid when only one object varies.

### Builder

Use when constructing complex objects step by step.

Good for:

- test data builders
- complex request payloads
- optional-heavy config objects

Avoid when a plain object literal is readable.

### Singleton

Use sparingly.

Good for:

- app-wide telemetry client
- global config registry
- shared dependency container

Avoid for business logic because it hides dependencies and hurts tests.

### Prototype

Use when cloning configured objects is easier than constructing new ones.

Good for:

- duplicating campaign drafts
- cloning form configs
- snapshotting state

Avoid for simple data objects where spread syntax is enough.

## Structural patterns

### Adapter

Use when external APIs or SDKs do not match your domain.

Good for:

- REST/gRPC/Supabase wrappers
- localStorage wrappers
- third-party SDK isolation

This is a core pattern for the architecture.

### Facade

Use when simplifying a complex subsystem.

Good for:

- one clean service over several lower-level APIs
- hiding SDK setup from feature code
- exposing simple feature operations

Avoid if it just becomes a vague “service” dumping ground.

### Decorator

Use when adding behavior around an object without changing it.

Good for:

- logging
- caching
- retries
- metrics
- authorization wrappers

Avoid when inheritance or direct changes are simpler.

### Proxy

Use when controlling access to another object.

Good for:

- lazy loading
- permission checks
- remote resources
- memoized expensive calls

Avoid if it hides important behavior.

### Composite

Use when treating individual and grouped objects the same way.

Good for:

- nested menus
- tree views
- nested form sections
- permission trees

Avoid for flat data.

### Bridge

Use when abstraction and implementation should vary independently.

Good for:

- domain operation independent from API implementation
- rendering abstraction independent from platform

Avoid unless both sides genuinely vary.

## Behavioral patterns

### Observer

Use when many consumers need to react to state changes.

Good for:

- presenter syncing to domain state
- event streams
- pub/sub state updates

Avoid if direct function calls are simpler.

### Strategy

Use when swapping algorithms/behavior by type.

Good for:

- campaign validation by channel
- pricing/calculation rules
- sorting/filtering behavior
- form behavior by module type

Prefer this over big `switch` statements when behavior grows.

### Command

Use when actions should be represented as objects/functions.

Good for:

- undo/redo
- queued actions
- toolbar actions
- button action maps
- workflow steps

Avoid when a direct function call is enough.

### State

Use when behavior changes based on internal state.

Good for:

- multi-step forms
- connection/session state
- campaign lifecycle states
- approval flows

Avoid if a simple status enum is enough.

### Template Method

Use when steps are fixed but some steps vary.

Good for:

- shared import/export flows
- shared submit flow with channel-specific hooks

In TypeScript, often prefer composition with functions over class inheritance.

### Chain of Responsibility

Use when multiple handlers may process a request.

Good for:

- validation pipelines
- middleware
- permission checks
- message routing

Avoid if order is unclear or debugging becomes hard.

### Mediator

Use when many objects communicate in messy ways.

Good for:

- complex UI coordination
- feature-level orchestration

Avoid if it becomes a god object.

### Memento

Use when saving/restoring snapshots.

Good for:

- undo
- draft restore
- form snapshot rollback

Avoid for large objects unless memory is controlled.

### Visitor

Use when applying operations across a stable object structure.

Good for:

- AST-like trees
- complex config trees

Avoid in normal app code unless the structure is stable and operations vary often.

## Practical default choices

Use these often:

- Adapter for external services
- Strategy for behavior by type
- Factory for runtime construction
- Observer for domain-to-presenter updates
- Command for user-triggered actions
- Builder for tests

Be cautious with:

- Singleton
- Visitor
- Mediator
- Abstract Factory

## Choosing a pattern

Ask:

1. What varies?
2. What should stay stable?
3. Is this complexity real now, or speculative?
4. Can a simple function solve it?
5. Will this improve testing and readability?
6. Will another dev understand this quickly?

If the pattern does not make the code easier to change or test, do not use it.
