# domain_presenter_view_seams_example.md

## Goal

Show the actual seams for a class-based domain / presenter / React view pattern.

Feature example: **VisitedPlaces**

- domain is a class
- domain owns core logic
- domain uses signals/runners internally
- domain exposes broadcasts from signals/runners
- presenter is a class
- presenter consumes domain broadcasts
- presenter exposes view-facing broadcasts
- React components use `useSignalValue` to read presenter broadcasts
- components stay dumb

> Naming is intentionally snake_case for files to match this instruction file style.
> Naming is intentionally camelCase for code within the file.

---

## Folder Structure

```txt
src/app/visited_places/
  domain/
    visited_places_domain.ts
    types.ts
  presenter/
    visited_places_presenter.ts
    visited_places_presenter_port.ts
  adapter/
    visited_places_api_adapter.ts
    visited_places_api_adapter_port.ts
  view/
    visited_places_view.tsx
    visited_places_wrapper.tsx
```

---

## Mental Model

```txt
React view
  ↓ uses useSignalValue(...)
Presenter class
  ↓ exposes view-facing broadcasts
  ↓ subscribes to domain broadcasts
Domain class
  ↓ owns business rules
  ↓ owns runners/signals
Adapter
  ↓ talks to API / storage / external world
```

---

## Core Rule

The **domain** should be runnable headlessly.

That means this should be possible:

```ts
const domain = new VisitedPlacesDomain({ apiAdapter });

domain.togglePlace({ id: 'zion', name: 'Zion National Park' });

console.log(domain.visitedPlacesBroadcast.get());
```

No React. No JSX. No component lifecycle.

---

## 1. Types

```ts
// src/app/visited_places/domain/visited_places_types.ts

export type VisitedPlace = {
  id: string;
  name: string;
};

export type VisitedPlacesState = {
  visitedPlaces: VisitedPlace[];
  selectedPlaceId: string | null;
};
```

---

## 2. Adapter Port

```ts
// src/app/visited_places/adapters/visited_places_api_adapter_port.ts

import type { VisitedPlace } from '../domain/visited_places_types';

export type VisitedPlacesApiAdapterPort = {
  saveVisitedPlaces: (visitedPlaces: VisitedPlace[]) => Promise<void>;
};
```

---

## 3. Adapter Implementation

```ts
// src/app/visited_places/adapters/visited_places_api_adapter.ts

import type { VisitedPlace } from '../domain/visited_places_types';
import type { VisitedPlacesApiAdapterPort } from './visited_places_api_adapter_port';

export class VisitedPlacesApiAdapter implements VisitedPlacesApiAdapterPort {
  saveVisitedPlaces = async (visitedPlaces: VisitedPlace[]): Promise<void> => {
    await fetch('/api/visited_places', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ visitedPlaces }),
    });
  };
}
```

---

## 4. Domain Signals

This file centralizes the domain-owned signals.

The exact constructors/helpers may differ in your repo. The important thing is:

- domain owns these signals
- domain mutates these signals
- domain exposes read-only broadcasts from them

```ts
// src/app/visited_places/domain/visited_places_signals.ts

import { Signal } from '@tcn/state';

import type { VisitedPlace } from './visited_places_types';

export class VisitedPlacesSignals {
  readonly visitedPlacesSignal = new Signal<VisitedPlace[]>([]);
  readonly selectedPlaceIdSignal = new Signal<string | null>(null);
}
```

---

## 5. Domain Runner

Runner handles an async action and exposes its own broadcast/state.

The domain uses this runner. The presenter reads its broadcast.

```ts
// src/app/visited_places/domain/save_visited_places_runner.ts

import { Runner } from '@tcn/state';

import type { VisitedPlacesApiAdapterPort } from '../adapters/visited_places_api_adapter_port';
import type { VisitedPlace } from './visited_places_types';

export class SaveVisitedPlacesRunner {
  private readonly _apiAdapter: VisitedPlacesApiAdapterPort;

  readonly runner = new Runner<void>(undefined);
  readonly broadcast = this.runner.broadcast;

  constructor(params: { apiAdapter: VisitedPlacesApiAdapterPort }) {
    this._apiAdapter = params.apiAdapter;
  }

  execute = async (visitedPlaces: VisitedPlace[]): Promise<void> => {
    await this.runner.execute(async () => {
      await this._apiAdapter.saveVisitedPlaces(visitedPlaces);
    });
  };
}
```

---

## 6. Domain Class

This is the source of truth.

```ts
// src/app/visited_places/domain/visited_places_domain.ts

import type { VisitedPlacesApiAdapterPort } from '../adapters/visited_places_api_adapter_port';
import { SaveVisitedPlacesRunner } from './save_visited_places_runner';
import { VisitedPlacesSignals } from './visited_places_signals';
import type { VisitedPlace } from './visited_places_types';

export class VisitedPlacesDomain {
  private readonly _signals = new VisitedPlacesSignals();

  private readonly _saveRunner: SaveVisitedPlacesRunner;

  readonly visitedPlacesBroadcast = this._signals.visitedPlacesSignal.broadcast;

  readonly selectedPlaceIdBroadcast = this._signals.selectedPlaceIdSignal.broadcast;

  readonly saveVisitedPlacesBroadcast: SaveVisitedPlacesRunner['broadcast'];

  constructor(params: { apiAdapter: VisitedPlacesApiAdapterPort }) {
    this._saveRunner = new SaveVisitedPlacesRunner({
      apiAdapter: params.apiAdapter,
    });

    this.saveVisitedPlacesBroadcast = this._saveRunner.broadcast;
  }

  togglePlace = async (place: VisitedPlace): Promise<void> => {
    const visitedPlaces = this._signals.visitedPlacesSignal.get();

    const isVisited = visitedPlaces.some((visitedPlace) => visitedPlace.id === place.id);

    const nextVisitedPlaces = isVisited
      ? visitedPlaces.filter((visitedPlace) => visitedPlace.id !== place.id)
      : [...visitedPlaces, place];

    this._signals.visitedPlacesSignal.set(nextVisitedPlaces);

    if (isVisited && this._signals.selectedPlaceIdSignal.get() === place.id) {
      this._signals.selectedPlaceIdSignal.set(null);
    }

    await this._saveRunner.execute(nextVisitedPlaces);
  };

  selectPlace = (placeId: string): void => {
    const visitedPlaces = this._signals.visitedPlacesSignal.get();

    const isVisited = visitedPlaces.some((visitedPlace) => visitedPlace.id === placeId);

    if (isVisited === false) {
      throw new Error('Cannot select a place that has not been visited');
    }

    this._signals.selectedPlaceIdSignal.set(placeId);
  };

  clearSelectedPlace = (): void => {
    this._signals.selectedPlaceIdSignal.set(null);
  };
}
```

### Domain rules

- domain is a class
- domain owns the business rules
- domain owns signals
- domain owns runners
- domain exposes broadcasts
- domain should be testable without React
- domain does **not** import components
- domain does **not** know about `useSignalValue`

---

## 7. Presenter Port

The presenter exposes only what React is allowed to use.

```ts
// src/app/visited_places/presenter/visited_places_presenter_port.ts

import type { Broadcast, IRunnerBroadcast } from '@tcn/state';

import type { VisitedPlace } from '../domain/visited_places_types';

export type VisitedPlacesPresenterPort = {
  visitedPlacesBroadcast: Broadcast<VisitedPlace[]>;
  selectedPlaceIdBroadcast: Broadcast<string | null>;
  saveStateBroadcast: IRunnerBroadcast<void>;

  togglePlace: (place: VisitedPlace) => Promise<void>;
  selectPlace: (placeId: string) => void;
  clearSelectedPlace: () => void;
};
```

---

## 8. Presenter Class

The presenter is a class.

It consumes domain broadcasts and exposes view-facing broadcasts.

Sometimes the presenter can simply pass domain broadcasts through. Other times it can create derived signals for the view.

```ts
// src/app/visited_places/presenter/visited_places_presenter.ts

import { Signal } from '@tcn/state';

import { VisitedPlacesDomain } from '../domain/visited_places_domain';
import type { VisitedPlace } from '../domain/visited_places_types';
import type { VisitedPlacesPresenterPort } from './visited_places_presenter_port';

export class VisitedPlacesPresenter implements VisitedPlacesPresenterPort {
  private readonly _domain: VisitedPlacesDomain;

  private readonly _visitedPlacesSignal = new Signal<VisitedPlace[]>([]);
  private readonly _selectedPlaceIdSignal = new Signal<string | null>(null);

  readonly visitedPlacesBroadcast = this._visitedPlacesSignal.broadcast;
  readonly selectedPlaceIdBroadcast = this._selectedPlaceIdSignal.broadcast;
  readonly saveStateBroadcast = this._domain.saveVisitedPlacesBroadcast;

  constructor(params: { domain: VisitedPlacesDomain }) {
    this._domain = params.domain;

    this._domain.visitedPlacesBroadcast.subscribe((visitedPlaces) => {
      this._visitedPlacesSignal.set(visitedPlaces);
    });

    this._domain.selectedPlaceIdBroadcast.subscribe((selectedPlaceId) => {
      this._selectedPlaceIdSignal.set(selectedPlaceId);
    });

    // Runner status/error/progress remain on saveStateBroadcast.stateBroadcast.
  }

  togglePlace = async (place: VisitedPlace): Promise<void> => {
    await this._domain.togglePlace(place);
  };

  selectPlace = (placeId: string): void => {
    this._domain.selectPlace(placeId);
  };

  clearSelectedPlace = (): void => {
    this._domain.clearSelectedPlace();
  };
}
```

### Presenter rules

- presenter is a class
- presenter consumes domain broadcasts
- presenter exposes view-facing broadcasts
- presenter delegates commands to domain
- presenter does **not** duplicate domain rules
- presenter does **not** import React
- presenter does **not** call API adapters directly unless it is explicitly orchestration-only in your team’s pattern

---

## 9. React View

React reads presenter broadcasts using `useSignalValue`.

```tsx
// src/app/visited_places/view/visited_places_view.tsx

import { Status } from '@tcn/state';
import { useRunnerError, useRunnerStatus, useSignalValue } from '@tcn/state/react';

import type { VisitedPlace } from '../domain/visited_places_types';
import type { VisitedPlacesPresenterPort } from '../presenter/visited_places_presenter_port';

type Props = {
  presenter: VisitedPlacesPresenterPort;
  availablePlaces: VisitedPlace[];
};

export const VisitedPlacesView = ({ presenter, availablePlaces }: Props) => {
  const visitedPlaces = useSignalValue(presenter.visitedPlacesBroadcast);
  const selectedPlaceId = useSignalValue(presenter.selectedPlaceIdBroadcast);
  const saveStatus = useRunnerStatus(presenter.saveStateBroadcast);
  const saveError = useRunnerError(presenter.saveStateBroadcast);

  return (
    <section>
      <h2>Visited places</h2>

      {saveError ? <p role='alert'>{saveError.message}</p> : null}

      {saveStatus === Status.PENDING ? <p>Saving...</p> : null}

      <ul>
        {availablePlaces.map((place) => {
          const isVisited = visitedPlaces.some((visitedPlace) => visitedPlace.id === place.id);
          const isSelected = selectedPlaceId === place.id;

          return (
            <li key={place.id}>
              <button type="button" onClick={() => presenter.togglePlace(place)}>
                {isVisited ? "Remove" : "Add"} {place.name}
              </button>

              {isVisited ? (
                <button type="button" aria-pressed={isSelected} onClick={() => presenter.selectPlace(place.id)}>
                  {isSelected ? "Selected" : "Select"}
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>

      <button type="button" onClick={presenter.clearSelectedPlace}>
        Clear selection
      </button>
    </section>
  );
};
```

### View rules

- view calls `useSignalValue`
- view receives presenter through props/context
- view does not instantiate domain
- view does not instantiate adapter
- view does not mutate signals
- view does not contain business rules
- view only renders and calls presenter commands

---

## 10. Composition Root

The composition root wires classes together.

```tsx
// src/app/visited_places/visited_places_composition.tsx

import { VisitedPlacesApiAdapter } from './adapters/visited_places_api_adapter';
import { VisitedPlacesView } from './view/visited_places_view';
import { VisitedPlacesDomain } from './domain/visited_places_domain';
import type { VisitedPlace } from './domain/visited_places_types';
import { VisitedPlacesPresenter } from './presenter/visited_places_presenter';

const availablePlaces: VisitedPlace[] = [
  { id: 'zion', name: 'Zion National Park' },
  { id: 'bryce_canyon', name: 'Bryce Canyon' },
  { id: 'snow_canyon', name: 'Snow Canyon' },
];

const apiAdapter = new VisitedPlacesApiAdapter();

const domain = new VisitedPlacesDomain({
  apiAdapter,
});

const presenter = new VisitedPlacesPresenter({
  domain,
});

export const VisitedPlacesComposition = () => {
  return <VisitedPlacesView presenter={presenter} availablePlaces={availablePlaces} />;
};
```

---

## Actual Seam Summary

```txt
domain signal
  → domain broadcast
  → presenter subscription
  → presenter signal
  → presenter broadcast
  → useSignalValue(...)
  → React render
```

Command flow:

```txt
button click
  → presenter.togglePlace(place)
  → domain.togglePlace(place)
  → domain updates signal
  → broadcast emits
  → presenter updates its signal
  → presenter broadcast emits
  → component re-renders
```

---

## What Goes Where

| Concern                | Layer                           |
| ---------------------- | ------------------------------- |
| visited place state    | domain signal                   |
| selected place state   | domain signal                   |
| async save lifecycle   | domain runner                   |
| API save call          | adapter                         |
| domain broadcasts      | domain                          |
| view-facing broadcasts | presenter                       |
| React subscription     | component with `useSignalValue` |
| object wiring          | composition root                |

---

## Anti-Patterns

### Bad: component directly reads domain

```tsx
const visitedPlaces = useSignalValue(domain.visitedPlacesBroadcast);
```

React should depend on the presenter, not the domain.

---

### Bad: component mutates signal

```tsx
presenter.visitedPlacesBroadcast.set([]);
```

Views should call commands, not mutate state.

---

### Bad: presenter duplicates business rules

```ts
if (visitedPlaces.some((place) => place.id === placeId) === false) {
  throw new Error('Cannot select unvisited place');
}
```

That rule belongs in the domain.

---

### Bad: domain imports React

```ts
import { useSignalValue } from "@tcn/state/react";
```

Domain should remain headless.

---

## Testing Strategy

### Domain tests

Use real domain, fake adapter.

```ts
const savedVisitedPlaces: VisitedPlace[][] = [];

const apiAdapter = {
  saveVisitedPlaces: async (visitedPlaces: VisitedPlace[]) => {
    savedVisitedPlaces.push(visitedPlaces);
  },
};

const domain = new VisitedPlacesDomain({ apiAdapter });

await domain.togglePlace({ id: "zion", name: "Zion National Park" });

expect(domain.visitedPlacesBroadcast.get()).toEqual([{ id: 'zion', name: 'Zion National Park' }]);
```

---

### Presenter tests

Use real presenter and real/fake domain.

```ts
const presenter = new VisitedPlacesPresenter({ domain });

await presenter.togglePlace({ id: "zion", name: "Zion National Park" });

expect(presenter.visitedPlacesBroadcast.get()).toEqual([{ id: 'zion', name: 'Zion National Park' }]);
```

---

### Component tests

Only test rendering/wiring.

- renders visited places from presenter broadcast
- clicking button calls presenter command
- save loading state displays
- error message displays

Do **not** retest domain rules in component tests.

---

## TLDR

- domain and presenter are classes
- domain owns runners/signals
- domain exposes broadcasts
- presenter subscribes to domain broadcasts
- presenter exposes view broadcasts
- React components use `useSignalValue`
- components call presenter commands
- business rules live in the domain
