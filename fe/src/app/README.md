# Frontend Feature Structure

Each feature should follow this shape:

```txt
feature-name/
  domain/
    tests/
    feature-domain.ts
    domain-model.ts
    domain-ports.ts
  adapter/
    feature-api-adapter.ts
    packers.ts
    unpackers.ts
  presenter/
    feature-presenter.ts
  view/
    wrapper.tsx
    components/
  utils/
```

Current scaffold uses `app-shell` as a non-business bootstrap example.
