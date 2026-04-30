← [Tech Stack](../tech-stack.md)

# Application Architecture

How the backend solution is structured, how data is persisted, and how the application layer is wired.

## Current State

Pre-implementation. The structure described here is a **target**, not yet realized in code; the implementation scaffold lands as a separate plan informed by this topic.

## .NET solution layout

A single `.sln` at `backend/Optimus.sln`, with four projects under `backend/src/` and matching test projects under `backend/tests/`:

| Project | Responsibility |
|---|---|
| `Optimus.Api` | ASP.NET Core entry point: minimal API endpoints, middleware (auth, correlation ID, request logging), Serilog setup, dependency wiring |
| `Optimus.Application` | Use-case layer: MediatR command/query handlers, FluentValidation validators, pipeline behaviors (logging, validation, transactions). Pure C# — no ASP.NET, no EF Core |
| `Optimus.Domain` | Entities, value objects, domain interfaces (e.g., `ILenderAdapter`), enums. No external dependencies |
| `Optimus.Infrastructure` | EF Core `DbContext`, Npgsql configuration, repository implementations, third-party integrations including **lender adapters as in-process modules**, Auth0 client, secrets, file storage |
| `tests/Optimus.Api.Tests` | API-layer integration tests |
| `tests/Optimus.Application.Tests` | Handler/validator unit tests |

`Domain` has no dependencies on the other projects. `Application` depends on `Domain`. `Infrastructure` and `Api` depend on `Application` and `Domain`. This dependency direction (the standard clean-layered shape) keeps domain logic testable without web or database mocks.

A common `Directory.Build.props` at `backend/` sets the target framework (`net8.0`), nullable reference types, treat-warnings-as-errors, and language version once for every project.

## Persistence: EF Core + Npgsql + PostgreSQL

- `AppDbContext` lives in `Optimus.Infrastructure/Persistence/`.
- Connection string is sourced from configuration (`Database:ConnectionString`); in production this is bound from the DigitalOcean managed-database connection string injected as an env var.
- The Npgsql data source is built with `EnableDynamicJson()` so JSONB columns can be used for flexible-shape data (e.g., raw lender payloads kept for audit purposes — see [observability.md](observability.md) and [compliance.md](../compliance.md)).
- EF Core migrations are checked into `Optimus.Infrastructure/Migrations/`.

## Migration policy: dev auto-migrate, prod gated

- In **development**, a `Database:AutoMigrate=true` config flag runs pending migrations on application startup. Convenient for fast iteration.
- In **production**, auto-migrate is **off**. Migrations are applied by an explicit step in the deploy pipeline (or a one-off `dotnet ef database update` command run against the production DB). This avoids a partial deploy doing a destructive migration if the rollout is interrupted.

## Application-layer mediator: MediatR + FluentValidation

- Every command and query is a record handled by a `MediatR.IRequestHandler<TRequest, TResponse>`.
- Cross-cutting concerns are pipeline behaviors:
  - `LoggingBehavior<,>` — logs the request name and execution time, attaches the correlation ID
  - `ValidationBehavior<,>` — runs all `IValidator<TRequest>` instances and short-circuits on failure
  - `TransactionBehavior<,>` — opens a DB transaction for commands that mutate state and commits on success
- FluentValidation validators live next to their request types in `Optimus.Application`.

This keeps controllers/endpoints thin (parse → send to MediatR → return result) and concentrates business rules in the application layer where they're easy to test.

## Tenant context

The platform is multi-tenant ([ownership-and-tenancy.md](../ownership-and-tenancy.md)). Tenant context is **ambient**, not parameterized:

- Middleware reads the active tenant from the authenticated user's claims (Auth0 Organization for contractor users; tenant header or query for admin cross-tenant operations).
- A request-scoped `TenantContext` service is exposed via DI; handlers and repositories receive it implicitly.
- EF Core query filters apply the tenant scope automatically; `AppDbContext.SaveChanges` stamps `tenant_id` on new entities.
- Cross-tenant access is the exception — gated by an explicit admin-role check and audit-logged.

Concrete schema (`tenant_id` columns, query-filter wiring, migration) is deferred to the implementation plan; the principle that tenant context is ambient is locked.

## Frontend deployment model: bundled into API `wwwroot/`

- The frontend (`frontend/`) is built with Vite and emits `dist/`.
- A multi-stage Dockerfile builds the frontend first, then copies `dist/` into the .NET image's `Optimus.Api/wwwroot/`. ASP.NET serves the SPA's static assets and a fallback route to `index.html` for client-side routing.
- One container, one DO App Platform service, one URL — frontend and backend deploy together. Detail in [infrastructure-and-deployment.md](infrastructure-and-deployment.md).
- In dev, `frontend/` runs on Vite's dev server (port 5173) and proxies `/api`, `/health`, `/swagger` to the backend on its Kestrel port. Frontend and backend run as separate processes locally.

## Key Decisions & Rationale

### Layered solution, not vertical slices

**Why:** Clean separation between web concerns, application logic, domain, and infrastructure makes testing and reasoning easier, especially when lender adapters land in `Infrastructure` and need to be swapped or extended without touching the application layer. Vertical-slice architecture is a fine alternative but adds friction when teams want to share patterns across slices; we'll cross that bridge if and when it becomes a real pain point.

**How to apply:** New code goes in the layer it logically belongs. Resist convenience moves that put EF Core types in `Domain` or HTTP types in `Application`.

### MediatR + FluentValidation, not direct controller logic

**Why:** Cross-cutting concerns (logging, validation, transactions) become pipeline behaviors instead of duplicated boilerplate. Application logic is dispatchable from anywhere — HTTP, background jobs, future workers, tests — without coupling to ASP.NET.

**How to apply:** Endpoints in `Optimus.Api` are 5–10 lines: parse the request, send via MediatR, return the result. Anything more belongs in a handler.

### Single DB, JSONB where shape varies

**Why:** Lender payloads, raw webhook bodies, and audit-detail blobs vary in shape. Modeling each variant as a typed table multiplies migration churn for no analytical benefit. JSONB columns let us store the raw shape and add typed views or materializations only where queries demand them.

**How to apply:** Use JSONB for inherently variable shapes. Use typed columns for everything we'll query, validate, or join on.

### Dev auto-migrate, prod manual

**Why:** Auto-migrate in dev keeps the inner loop fast. In production, an interrupted deploy mid-migration on a 24/7 system is hard to recover from; making the migration an explicit step makes the failure mode visible.

**How to apply:** When adding a migration, expect to run `dotnet ef database update` (or its equivalent in CI/CD) as part of the deploy. Don't add config to enable production auto-migrate "for now."

## Known Limitations

- The exact MediatR behavior pipeline ordering (logging → validation → transaction → handler) is canonical but worth re-confirming during implementation.
- The dependency-injection composition (where each layer registers its services) is a convention to keep tidy as the codebase grows; expect a `DependencyInjection.cs` per project.
- The implementation plan will need to confirm whether to use `dotnet-ef` migrations or an alternative (FluentMigrator, Grate, etc.). Default assumption is EF Core's built-in tooling.

## Deferred / Future

- A separate `Optimus.Worker` project (background-job process) — added when the first async use case emerges (e.g., long-running webhook processing). For now, in-process `IHostedService` covers it.
- Splitting any layer into multiple projects (e.g., `Optimus.Application.Lending`, `Optimus.Application.Onboarding`) — only when the single `Application` project becomes hard to navigate.
- Test architecture beyond xUnit + a couple of integration tests — defer until coverage gaps are real.

## Cross-References

See also: [tech-stack.md](../tech-stack.md), [adapter-architecture.md](../lender-integration-model/adapter-architecture.md), [infrastructure-and-deployment.md](infrastructure-and-deployment.md), [observability.md](observability.md), [compliance.md](../compliance.md), [ownership-and-tenancy.md](../ownership-and-tenancy.md).
