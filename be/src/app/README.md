# app

Backend feature slices live under this directory.

Each feature should use this shape:

```txt
feature-name/
  domain/
    tests/
    feature-domain.ts
    domain-model.ts
    domain-ports.ts
  adapter/
    http/
      feature-routes.ts
      packers.ts
      unpackers.ts
    sqlite/
      feature-repository.ts
      schema.ts
  service/
    feature-service.ts
  utils/
```
