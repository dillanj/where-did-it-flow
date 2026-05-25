# @tcn/state

A lightweight, type-safe state management library for TypeScript applications.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core Concepts](#core-concepts)
- [Using Signals](#using-signals)
- [Using Runners](#using-runners)
- [React Integration](#react-integration)
- [API Reference](#api-reference)
- [Troubleshooting](#troubleshooting)

## Installation

```bash
npm install @tcn/state
# or
yarn add @tcn/state
# or
pnpm add @tcn/state
```

## Entry Points

The library provides multiple entry points to optimize your bundle size:

| Entry Point | Description | React Required |
|-------------|-------------|----------------|
| `@tcn/state` | Everything (backward compatible) | Yes |
| `@tcn/state/core` | Core utilities only (Signal, Runner, events) | No |
| `@tcn/state/react` | React hooks only | Yes |

### Importing Core Utilities (No React)

Use this when you need state management in non-React contexts or want to avoid bundling React:

```typescript
import { Signal, Runner, Event } from '@tcn/state/core';
```

### Importing React Hooks

Use this when you only need the React integration:

```typescript
import { useSignalValue, useRunnerStatus } from '@tcn/state/react';
```

### Importing Everything

For backward compatibility, the main entry point exports everything:

```typescript
import { Signal, Runner, useSignalValue } from '@tcn/state';
```

## Quick Start

### Basic Counter Example

```typescript
// CounterPresenter.ts
class CounterPresenter {
  private _countSignal: Signal<number>;

  get countBroadcast() {
    return this._countSignal.broadcast;
  }

  constructor() {
    this._countSignal = new Signal<number>(0);
  }

  increment() {
    this._countSignal.transform(count => count + 1);
  }

  decrement() {
    this._countSignal.transform(count => count - 1);
  }

  dispose() {
    this._countSignal.dispose();
  }
}

// Counter.tsx
function Counter({ presenter }: { presenter: CounterPresenter }) {
  const count = useSignalValue(presenter.countBroadcast);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => presenter.increment()}>Increment</button>
      <button onClick={() => presenter.decrement()}>Decrement</button>
    </div>
  );
}
```

## Core Concepts

The library provides two main classes for state management:

1. **Signal<T>**: Base class for reactive state management
   - Manages a single value of type T
   - Notifies subscribers when the value changes
   - Provides memory-efficient updates through `transform`

2. **Runner<T>**: Extends Signal<T> for handling async operations
   - Manages async operation state (INITIAL, PENDING, SUCCESS, ERROR)
   - Provides progress tracking and error handling
   - Supports retry and reset operations

## Using Signals

Signals are designed to be encapsulated within classes, providing controlled access to state through readonly interfaces.

### Basic Usage

```typescript
class TodoListPresenter {
  private _todosSignal: Signal<Todo[]>;
  private _completedTodosSignal: Signal<number>;

  get todosBroadcast() {
    return this._todosSignal.broadcast;
  }

  get completedCountBroadcast() {
    return this._completedTodosSignal.broadcast;
  }

  constructor() {
    this._todosSignal = new Signal<Todo[]>([]);
    this._completedTodosSignal = new Signal<number>(0);

    this._todosSignal.subscribe(todos => {
      this._completedTodosSignal.set(
        todos.filter(todo => todo.completed).length
      );
    });
  }

  dispose() {
    this._todosSignal.dispose();
    this._completedTodosSignal.dispose();
  }
}
```

## Using Runners

Runners provide a powerful way to manage asynchronous operations with built-in state management.

### Status Types

1. **INITIAL**: Default state, no operation running
2. **PENDING**: Operation in progress, progress can be updated
3. **SUCCESS**: Operation completed successfully
4. **ERROR**: Operation failed, contains error information

### Basic Usage

```typescript
class DataServicePresenter {
  private _dataRunner: Runner<Data>;

  get dataBroadcast() {
    return this._dataRunner.broadcast;
  }

  constructor() {
    this._dataRunner = new Runner<Data>(null);
  }

  async fetchData() {
    await this._dataRunner.execute(async () => {
      const response = await fetch('/api/data');
      return await response.json();
    });
  }

  dispose() {
    this._dataRunner.dispose();
  }
}
```

## React Integration

### Presenter Patterns

1. **Root Presenter Pattern** (Recommended)
   ```typescript
   class AppPresenter {
     readonly userPresenter: UserPresenter;
     
     constructor() {
       this.userPresenter = new UserPresenter();
     }
     
     dispose() {
       this.userPresenter.dispose();
     }
   }
   ```

2. **Local State Pattern** (For isolated components)
   ```typescript
   function MyComponent() {
     const [presenter] = useState(() => new MyPresenter());
     
     useEffect(() => {
       return () => presenter.dispose();
     }, [presenter]);
     
     return <div>...</div>;
   }
   ```

### React Hooks

- `useSignalValue<T>(broadcast: IBroadcast<T>)`: T
- `useRunnerStatus<T>(broadcast: IRunnerBroadcast<T>)`: Status
- `useRunnerProgress<T>(broadcast: IRunnerBroadcast<T>)`: number
- `useRunnerError<T>(broadcast: IRunnerBroadcast<T>)`: Error | null

## API Reference

### Signal<T>

#### Methods
- `set(value: T)`: void
- `transform(cb: (val: T) => T)`: void
- `subscribe(callback: (value: T) => void)`: ISubscription<T>
- `dispose()`: void

### Runner<T>

#### Methods
- `execute(action: () => Promise<T>)`: Promise<T>
- `dispatch(action: () => Promise<T>)`: Promise<void>
- `retry()`: Promise<T>
- `reset()`: void
- `setProgress(progress: number)`: void
- `setFeedback(feedback: string)`: void
- `setError(error: Error | null)`: void
- `dispose()`: void

## Troubleshooting

1. **Memory Management**
   - Its advised to call `dispose()` on signals and runners when they're no longer needed, but not necessary because Signals subscriptions are WeakRefs
   - When using the Root Presenter Pattern (injecting presenters through props), DO NOT dispose the presenter in the component
   - When using the Local State Pattern (creating presenters with useState), you MUST dispose the presenter in the component's cleanup function

2. **Performance**
   - Use `transform` for memory-efficient updates
   - Avoid creating new arrays/objects when updating state
   - Don't create new signals in render methods

3. **Type Safety**
   - Always specify generic types for signals and runners
   - Use TypeScript's type inference when possible
   - Maintain type consistency across your application

## Examples

### Real-time Data Updates

```typescript
import { Signal, Runner } from '@tcn/state/core';

class StockPricePresenter {
  private _priceSignal: Signal<number>;
  private _updateRunner: Runner<void>;
  private _ws: WebSocket | null;
  private _symbol: string;

  get priceBroadcast() {
    return this._priceSignal.broadcast;
  }

  get updateRunnerBroadcast() {
    return this._updateRunner.broadcast;
  }

  constructor(symbol: string) {
    this._symbol = symbol;
    this._priceSignal = new Signal<number>(0);
    this._updateRunner = new Runner<void>();
    this._ws = null;
  }

  async initialize() {
    try {
      this._ws = new WebSocket(`wss://api.example.com/stock/${this._symbol}`);
      
      // Handle WebSocket connection
      this._ws.onopen = () => {
        console.log('WebSocket connected');
      };

      // Handle WebSocket messages
      this._ws.onmessage = (event) => {
        const price = JSON.parse(event.data).price;
        this._priceSignal.set(price);
      };

      // Handle WebSocket errors
      this._ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this._updateRunner.setError(new Error('WebSocket connection failed'));
      };

      // Handle WebSocket closure
      this._ws.onclose = () => {
        console.log('WebSocket disconnected');
      };

      return true;
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this._updateRunner.setError(new Error('Failed to initialize WebSocket connection'));
      return false;
    }
  }

  async refresh() {
    await this._updateRunner.dispatch(async () => {
      const response = await fetch(`/api/stock/${this._symbol}`);
      const data = await response.json();
      this._priceSignal.set(data.price);
    });
  }

  dispose() {
    this._ws?.close();
    this._priceSignal.dispose();
    this._updateRunner.dispose();
  }
}

// Usage in React component
function StockPriceView({ presenter }: { presenter: StockPricePresenter }) {
  const price = useSignalValue(presenter.priceBroadcast);
  const status = useRunnerStatus(presenter.updateRunnerBroadcast);
  const error = useRunnerError(presenter.updateRunnerBroadcast);

  useEffect(() => {
    // Initialize WebSocket connection when component mounts
    presenter.initialize();

    // Cleanup when component unmounts
    return () => {
      presenter.dispose();
    };
  }, []);

  if (status === 'ERROR') {
    return (
      <div>
        <p>Error: {error?.message}</p>
        <button onClick={() => presenter.initialize()}>Retry Connection</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Stock Price: ${price}</h2>
      <button onClick={() => presenter.refresh()}>Refresh Price</button>
    </div>
  );
}
```

### Presenter Composition

```typescript
// AppPresenter.ts
class AppPresenter {
  // Pattern 1: Readonly property for permanent presenters
  // - Used when the child presenter is always needed
  // - The child presenter is created once and lives as long as the parent
  // - Access is direct and type-safe
  readonly toolbarPresenter: ToolbarPresenter;

  // Pattern 2: Signal for dynamic presenters
  // - Used when the child presenter may come and go
  // - The child presenter can be created and disposed on demand
  // - Access requires checking for null
  private _sidebarSignal: Signal<SidebarPresenter | null>;

  get sidebarBroadcast() {
    return this._sidebarSignal.broadcast;
  }

  constructor() {
    // Pattern 1: Initialize permanent presenters in constructor
    this.toolbarPresenter = new ToolbarPresenter();
    
    // Pattern 2: Initialize signal with null for dynamic presenters
    this._sidebarSignal = new Signal<SidebarPresenter | null>(null);
  }

  toggleSidebar() {
    if (this._sidebarSignal.get() === null) {
      // Pattern 2: Create new presenter when needed
      this._sidebarSignal.set(new SidebarPresenter());
    } else {
      // Pattern 2: Clean up and remove presenter when no longer needed
      this._sidebarSignal.get()?.dispose();
      this._sidebarSignal.set(null);
    }
  }

  dispose() {
    // Pattern 1: Clean up permanent presenters
    this.toolbarPresenter.dispose();
    
    // Pattern 2: Clean up dynamic presenters if they exist
    this._sidebarSignal.get()?.dispose();
    this._sidebarSignal.dispose();
  }
}

// App.tsx
function App() {
  const [appPresenter] = useState(() => new AppPresenter());
  const sidebarPresenter = useSignalValue(appPresenter.sidebarBroadcast);

  useEffect(() => {
    return () => appPresenter.dispose();
  }, [appPresenter]);

  return (
    <div className="app">
      {/* Pattern 1: Direct access to permanent presenter */}
      <Toolbar presenter={appPresenter.toolbarPresenter} />
      
      <div className="content">
        <button onClick={() => appPresenter.toggleSidebar()}>
          {sidebarPresenter ? 'Hide Sidebar' : 'Show Sidebar'}
        </button>
        
        {/* Pattern 2: Conditional rendering based on presenter existence */}
        {sidebarPresenter && (
          <Sidebar presenter={sidebarPresenter} />
        )}
      </div>
    </div>
  );
}
```

## Presenter Composition Patterns

The library supports two main patterns for composing presenters:

### 1. Permanent Presenters (Readonly Properties)
```typescript
class ParentPresenter {
  // Child presenter is always available
  readonly childPresenter: ChildPresenter;
  
  constructor() {
    this.childPresenter = new ChildPresenter();
  }
}
```
Use this pattern when:
- The child presenter is always needed
- The child's lifecycle matches the parent's
- You need direct, type-safe access to the child

### 2. Dynamic Presenters (Signals)
```typescript
class ParentPresenter {
  private _childSignal: Signal<ChildPresenter | null>;
  
  get childBroadcast() {
    return this._childSignal.broadcast;
  }
  
  constructor() {
    this._childSignal = new Signal<ChildPresenter | null>(null);
  }
  
  toggleChild() {
    if (this._childSignal.get() === null) {
      this._childSignal.set(new ChildPresenter());
    } else {
      this._childSignal.get()?.dispose();
      this._childSignal.set(null);
    }
  }
}
```
Use this pattern when:
- The child presenter may come and go
- The child's lifecycle is independent of the parent
- You need to conditionally render components based on the child's existence

### Choosing Between Patterns

1. **Use Permanent Presenters when:**
   - The child is a core part of the parent's functionality
   - The child's state needs to persist as long as the parent exists
   - You need direct access to the child's methods and properties

2. **Use Dynamic Presenters when:**
   - The child is optional or can be toggled
   - The child's state can be discarded when not needed
   - You want to save memory by disposing of unused presenters
   - The child's existence affects the UI layout

### Best Practices

1. **Memory Management:**
   - Always dispose of presenters when they're no longer needed
   - For permanent presenters, dispose them in the parent's dispose method
   - For dynamic presenters, dispose them before setting the signal to null

2. **Type Safety:**
   - Use TypeScript's type system to ensure proper access to presenters
   - For dynamic presenters, always check for null before accessing

3. **Component Integration:**
   - Use `useSignalValue` to subscribe to dynamic presenter signals
   - Pass permanent presenters directly as props
   - Use conditional rendering for dynamic presenters
