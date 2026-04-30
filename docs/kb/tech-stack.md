← [KB index](index.md)

# Tech Stack

The major tech-stack choices for the Optimus rewrite — what they are, why we picked them, and the principles that guide how we build on them.

## Current State

Pre-implementation. The major tech-stack decisions are now locked at the level of detail captured here. The implementation scaffold (repo skeleton, Docker build, CI/CD wiring, observability and auth wiring) is queued as a separate planning track that will use this section of the KB as its input.

## Headline choices

| Layer | Choice | Notes |
|---|---|---|
| Backend | **.NET 8** (LTS) | Opus One Platform constraint; .NET 8 LTS through Nov 2026, beyond the MVP target |
| Backend layout | **Api / Application / Domain / Infrastructure** layered solution + `tests/` | Standard clean-layered .NET pattern; lender adapters live in `Infrastructure` per [adapter-architecture.md](lender-integration-model/adapter-architecture.md) (in-process modules, not microservices) |
| Frontend | **React + TypeScript + Vite + Tailwind** | Frontend bundles into API `wwwroot/` for production; dev runs Vite proxying to backend |
| Mobile / PWA | **PWA-first** (vite-plugin-pwa, InjectManifest mode); **Bubblewrap TWA** for optional Android Play Store presence; **Capacitor iOS shell** deferred from MVP | Mobile-first across the whole frontend. Android: pure browser-installable PWA + optional Bubblewrap-generated TWA shell (lighter than Capacitor for Android — leverages the user's Chrome via Trusted Web Activity). iPhone users get the web PWA via Safari; Capacitor + WKWebView lands post-MVP. See [tech-stack/mobile-and-pwa.md](tech-stack/mobile-and-pwa.md) |
| Database | **PostgreSQL** (DigitalOcean managed) | EF Core with **Npgsql** provider; migrations in repo |
| Auth (platform users) | **Auth0** | Admin team + contractors. Universal Login + JWT bearer in API. See [tech-stack/authentication.md](tech-stack/authentication.md) |
| Auth (borrowers) | **One-time signed URL → short-lived session**, in-app, no third party | Borrowers don't get accounts. URL is sent at the right step in the consumer flow; backend validates an HMAC-signed token and issues an application-scoped session cookie |
| CI/CD | **GitHub Actions** | `ci` on PR + main (build/test); `cd` on main (build container, push to DigitalOcean Container Registry; App Platform auto-deploys) |
| Hosting | **Digital Ocean App Platform** via DigitalOcean Container Registry | One `.do/app.yaml` declares services + managed Postgres |
| Application logging | **Serilog** | JSON to stdout in prod, human-readable in dev; correlation IDs; request logging; MediatR `LoggingBehavior` |
| Observability | **Datadog** via DO managed log forwarding | App writes structured JSON to stdout; DO forwards; nothing Datadog-specific in app code |
| Application mediator | **MediatR** | Command/query handlers + cross-cutting pipeline behaviors (logging, validation, transactions) |
| Validation | **FluentValidation** | Wired through MediatR pipeline |

## Principles

### Mobile-first

The consumer flow, the contractor dashboard, and the borrower experience are all primarily-mobile per the in-home-sale context (the contractor opens the app on their phone or hands the phone to the homeowner — see [application-flow.md](application-flow.md)). Every UX decision starts at small screens (360px width minimum) and progressively enhances. Mobile is the default surface, not a responsive afterthought. See [tech-stack/mobile-and-pwa.md](tech-stack/mobile-and-pwa.md).

### Monolith-first

One deployable for MVP. Lender adapters are in-process modules in `Optimus.Infrastructure`, sharing the application's database and runtime. Background workers start as in-process `IHostedService`. Splitting to separate services happens only when real load or organizational need forces it. See [adapter-architecture.md](lender-integration-model/adapter-architecture.md).

### Build first, abstract second

Per the same adapter-architecture topic: don't design for variety we haven't yet seen. The first concrete lender integration leads; the abstraction follows once we know what's actually variable. The same rule applies elsewhere — don't generalize until there's a real second case.

### Dual-market awareness from day one

The platform serves both U.S. and Canada. State / province handling, jurisdiction-specific lender eligibility, and dual regulatory environments shape data models, validation, and routing inputs from the start. We do not build U.S.-only and retrofit Canada later.

### Audit and security baked in, not bolted on

Compliance is a facilitator concern (see [compliance.md](compliance.md)). Structured logging, correlation IDs, secrets handling, audit-log discipline, and consent capture exist from the first commit — not as a Q3 2026 hardening pass.

## What "enterprise-grade" means here

The kickoff materials called for an "enterprise-grade" platform. We treat that as: **secure, auditable, reliable, accessible, well-documented**. We do **not** treat it as a license to add complexity, ceremony, or pre-emptive scale.

## What we are explicitly NOT doing

These are explicitly out of scope until a real use case demands them. None are forbidden forever — but none earn space in MVP just because "enterprise" is on the box:

- Microservices, service mesh, message broker, event store, CQRS-with-event-sourcing
- Kubernetes, Helm, Terraform, Pulumi (DO App Platform's YAML is enough)
- Multi-region deployment, read replicas, database sharding
- A separate identity provider for borrowers (one-time URLs are simpler and a better fit — see [tech-stack/authentication.md](tech-stack/authentication.md))
- Full ELK / Grafana / Prometheus stack (DO + Datadog covers it — see [tech-stack/observability.md](tech-stack/observability.md))
- API gateway in front of the API
- Frontend micro-frontends or module federation
- Background-worker service as a separate deployment (in-process `IHostedService` first; split out later if real load demands)
- Custom dev container, Bazel, or monorepo build orchestration
- Native iOS app (Capacitor + WKWebView shell) — deferred from MVP, see [tech-stack/mobile-and-pwa.md](tech-stack/mobile-and-pwa.md)

## Sub-topics

- [tech-stack/application-architecture.md](tech-stack/application-architecture.md) — Layered .NET solution, EF Core, monolith-first, frontend-in-wwwroot
- [tech-stack/infrastructure-and-deployment.md](tech-stack/infrastructure-and-deployment.md) — Docker, DO App Platform, GitHub Actions, environments, secrets
- [tech-stack/observability.md](tech-stack/observability.md) — Serilog, Datadog log forwarding, correlation IDs, audit-log boundary
- [tech-stack/authentication.md](tech-stack/authentication.md) — Auth0 for platform users + one-time-URL flow for borrowers
- [tech-stack/mobile-and-pwa.md](tech-stack/mobile-and-pwa.md) — Mobile-first design, PWA via vite-plugin-pwa, Bubblewrap TWA for Android, Capacitor iOS deferred

## Cross-References

See also: [application-flow.md](application-flow.md), [adapter-architecture.md](lender-integration-model/adapter-architecture.md), [compliance.md](compliance.md), [mvp-scope.md](mvp-scope.md), [partner-and-borrower-experience.md](partner-and-borrower-experience.md).
