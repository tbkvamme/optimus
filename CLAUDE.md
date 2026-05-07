# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

This repo is **pre-implementation**. There is no application source and no build system yet — the repo is git-tracked but hasn't been wired up with any tooling. The team is gathering business rules, user flows, and lender requirements from the business/platform team so the rewrite ("Optimus") can be planned. Going-forward knowledge is consolidated in `docs/kb/`.

This is a **clean-room rewrite**. The existing legacy platform was built on technology controlled by a lending partner, and the new platform must be built independently from business knowledge and functional requirements — **not** by copying code, backend implementation, or technical patterns from the legacy system. Independence and IP ownership are core constraints, not nice-to-haves. The development team has explicitly opted out of access to the legacy codebase.

Until source code lands, work in this repo is research, note-taking, and spec-writing — not coding. Do not invent commands or claim the project builds, tests, or lints; none of that exists yet. When asked to draft architecture, schemas, or specs, write them as new files under `docs/`.

## Domain primer

Optimus is a **North American** consumer-lending platform for **home-improvement** financing (HVAC replacements, roofing, solar, battery storage, windows, etc.). The U.S. is the primary current market — ~$500M/year in funded U.S. volume, growth target ~$1B/year over the next couple of years — and **Canada is also in scope for the rewrite**. The platform must be designed to serve both markets from the start (state/province handling, per-jurisdiction lender eligibility, U.S. + Canadian regulatory environments).

Optimus is **not a lender**. It is a multi-lender broker/orchestrator that connects contractors, homeowners, and lenders. Most regulatory burden (loan documentation, IDV, credit approval, funding, servicing, required disclosures) lives at the lender; Optimus is the facilitation layer.

### Four user roles

- **Homeowner / Borrower** — receives the loan.
- **Contractor / Merchant / Seller** — sells the home-improvement work and originates the loan application on the homeowner's behalf, typically during an in-home sales conversation.
- **Lender** — third-party financing partner. Multiple lenders are integrated; each has its own application, statuses, disclosures, and APIs.
- **Platform / Admin team** — internal users who configure routing, manage contractors and lenders, and monitor operations.

### Platform ownership and tenancy

Optimus owns the running deployment, the database, and the source-code repository. **Digital Rain Tech (DRT)** operates the platform on Optimus's behalf for a fee. Within the deployment, each contractor company is a **tenant** with isolated data; sales reps and other employees are users *within* that tenant. Borrowers are application-scoped (not tenants). Lenders are platform-level integrations (not tenants). The Optimus admin team operates above the tenant layer with role-gated cross-tenant access — *not* blanket superuser. Multi-tenancy is baked in from Day 1: every business table gets a `tenant_id`. See [docs/kb/ownership-and-tenancy.md](docs/kb/ownership-and-tenancy.md).

### Routing model — rules-based, not a marketplace

Optimus uses **automatic rules-based routing** to send each application to the most appropriate lender. The contractor does **not** pick a lender from a list. Routing inputs:

- Borrower credit profile
- Project category (HVAC, solar, battery, etc.)
- State / province / location (U.S. and Canada both in scope)
- Lender eligibility rules
- Product type
- Available loan programs

Lender tiering is generally **prime → near-prime → subprime**, with the possibility of multiple prime lenders specialized per product category later. MVP starts simpler — see the MVP section below.

### Deliberate departures from legacy behavior

- **Prime-first prequalification.** The new platform should attempt to prequalify the customer through the prime lender *before* stepping down to lower-tier lenders. The intent is to maximize approval quality before falling back. This is an explicit improvement over current legacy behavior — call it out when designing routing logic.
- **Soft pull ownership.** Today the soft credit pull at prequal is performed by the lender. The long-term intent is for Optimus to own the soft pull independently of any individual lender. MVP may still rent it; the abstraction should leave room for the swap.

### End-to-end consumer flow (13 steps)

1. Contractor receives a unique application URL.
2. Contractor sends the link to the homeowner or uses it during the in-home sale.
3. Homeowner enters basic information (name, address, state, project category, soft-pull consent).
4. Soft credit pull.
5. System routes to the appropriate lender (prime first; step down on decline per routing rules).
6. Homeowner picks from the available loan plans for that lender.
7. Homeowner completes the **lender-specific** full application (financing amount, project type, language preference, borrower details, SSN, DOB, billing address, income, employment, optional co-applicant, required disclosures).
8. Lender performs hard credit pull.
9. Lender returns approval / pending / decline / lender-specific status.
10. **Loan-document signing happens with the lender, not in Optimus.** The lender sends documents to the borrower and runs its own signing flow. Pulling signing into Optimus would trigger additional IDV/compliance burden — keep it out of scope.
11. Contractor performs the project.
12. Contractor submits project completion (equipment details, brand, model #, serial #, project description, completion date, optional invoice). Lender then asks the homeowner to authorize funds release.
13. Contractor is paid.

Project completion + homeowner funding authorization (steps 11–13) is **MVP-required**, not a phase-2 nicety — that's where contractor revenue lands.

### Lenders, pathways, and starting state

The rewrite **starts at zero lenders** and adds them one at a time as deliberate per-lender business decisions (each integration carries a documented 30–60-day cost). Whatever lender names appear in legacy reference materials are historical partners, not MVP targets — see [`docs/kb/lender-integration-model.md`](docs/kb/lender-integration-model.md) and [`docs/kb/lender-routing.md`](docs/kb/lender-routing.md) for the abstraction the platform must support.

## MVP scope, timeline, and architectural posture

### MVP scope

- **Single prime lender + defined fallback** routing logic (not the full multi-tier matrix).
- **Contractor onboarding** flow (separate from the consumer application — onboards company structure, ownership details, tax ID, bank account, lender-required onboarding info, compliance training where lenders require it; contractor not activated until lender approval is complete).
- **End-to-end consumer flow** through funding (the 13 steps above), including project completion and homeowner funding authorization.
- **Contractor dashboard** with application status and loan progress (customer details, project address, application ID, lender, approval amount, current status, lender-event timeline, contact info, required next steps).
- **Mobile-friendly** consumer flow — explicit UX requirement, especially for in-home sales.
- **Multi-language** consumer flow — i18n from Day 1; English (US/CA) plus Canadian French as the MVP baseline given the dual-market constraint.
- **Clean, modern look and feel.**

### Architectural posture

- **Modular ("Lego") architecture**, standalone first. Tech-stack choice should not actively close the door on a future One Operations integration, but designing for that integration is out of scope for now — don't propose abstractions or design effort justified by it.
- **Lender abstraction.** Adding a new lender currently takes ~30–60 days. The new platform's lender-integration model must drive that down — pluggable adapters for application schema, status mapping, IDV requirements, disclosures, document flow, API differences, webhook handling.
- **Compliance posture.** Optimus is a facilitator, not a lender, so most compliance burden is offloaded to lenders. Still, design for security, auditability, data retention, and future compliance requirements from day one.

### Timeline

- **MVP** by end of summer 2026, ideally ready to begin lender API integration work by then.
- **Production** in 2027. The new platform runs in **parallel** with the existing Optimus: new loan originations cut over to the new platform. The current **working assumption** is that no data is imported from the legacy system — legacy continues to service its existing loans until they wind down naturally. This stance is pending business-team confirmation; see [`docs/kb/open-questions.md`](docs/kb/open-questions.md).

## Where canonical knowledge lives

Three sources, in this order of authority:

1. **`docs/references/meetings/`** — meeting notes from the platform/business team. `kickoff.md` is the current source of strategic intent. Future meeting notes land here.
2. **`docs/kb/`** — the Knowledgebase: distilled topic-level knowledge on routing, application flow, lender integration model, contractor onboarding, compliance, etc. Self-contained — designed to be the going-forward source of truth. See the Knowledgebase section below for the topic index.
3. **Forthcoming business-team deliverables** — business rules, decision trees, user stories, click-throughs / wireframes, lender-specific requirements, status definitions. These land under `docs/` as they arrive and seed updates to the KB.

All going-forward design substance previously distilled from legacy artifacts has been absorbed into the KB. The legacy reference folder has been removed; the KB stands on its own. **Clean-room rule** still applies as a project principle — should any future legacy material surface, do not copy code, backend patterns, or UI flows from it. See [`docs/kb/clean-room-rules.md`](docs/kb/clean-room-rules.md).

## File / path conventions

Per the user's global instructions: always use relative paths with forward slashes (`docs/kb/application-flow.md`), never absolute Windows paths and never backslashes, in tool calls and in prose.

## Tech stack

The major tech-stack choices are now locked. Detail and rationale: [`docs/kb/tech-stack.md`](docs/kb/tech-stack.md) and the sub-topics under [`docs/kb/tech-stack/`](docs/kb/tech-stack).

| Layer | Choice |
|-------|--------|
| Backend | .NET 8 (LTS), layered solution: `Optimus.Api` / `Optimus.Application` / `Optimus.Domain` / `Optimus.Infrastructure` + tests |
| Frontend | React + TypeScript + Vite + Tailwind, bundled into API `wwwroot/` for production |
| Mobile / PWA | PWA-first via vite-plugin-pwa (InjectManifest); **Bubblewrap TWA** as optional Android Play Store wrapper in MVP; **Capacitor iOS shell deferred** (iPhone users use the web PWA via Safari in MVP) |
| Database | PostgreSQL (DigitalOcean managed), EF Core + Npgsql, migrations in repo |
| Auth — platform users | Auth0 (admin team + contractors), JWT bearer in API |
| Auth — borrowers | One-time HMAC-signed URL → application-scoped session cookie, in-app, no third party |
| CI/CD | GitHub Actions: `ci` on PR/main, `cd` on main → push to DigitalOcean Container Registry → App Platform auto-deploys |
| Hosting | Digital Ocean App Platform via DOCR, declared in `.do/app.yaml` |
| Logging | Serilog → JSON to stdout |
| Observability | Datadog via DO managed log forwarding (no Datadog SDK in app code) |

The implementation scaffold (repo skeleton, `Dockerfile`, `.do/app.yaml`, GitHub Actions workflows, Serilog/Auth0 wiring, etc.) is queued as a separate planning track and **does not yet exist in the repo**. Until it lands, do not fabricate `dotnet`, `yarn`, or `docker` commands as if they ran here.

Project principles that bear on every implementation choice:
- **Mobile-first** — design starts at 360px width and progressively enhances. The in-home-sale handoff is the canonical use case.
- **Monolith-first** — one deployable for MVP; lender adapters are in-process modules in `Optimus.Infrastructure`.
- **Build first, abstract second** — don't generalize until there's a real second case (especially for lender adapters).
- **Dual-market** — U.S. and Canada from day one, not retrofitted.
- **Multi-language** — i18n from the first commit. No hardcoded user-facing strings. English (US/CA) plus Canadian French as the MVP baseline.
- **Audit and security baked in** — structured logging, correlation IDs, consent capture, audit-log discipline from the first commit.
- **Enterprise-grade = secure, auditable, reliable, accessible, well-documented** — *not* complex, ceremonial, or pre-emptively scaled.

## Knowledgebase

Project knowledge is documented in `docs/kb/`. Read topic files when working on related systems.

Topics are grouped to match the KB sidebar.

**Foundations**

| Topic | File | Summary |
|-------|------|---------|
| Domain glossary | [docs/kb/domain-glossary.md](docs/kb/domain-glossary.md) | Actor roles, prequal vs full app, soft/hard pull, prime/near-prime/subprime |
| Ownership and tenancy | [docs/kb/ownership-and-tenancy.md](docs/kb/ownership-and-tenancy.md) | Optimus owns deployment, DRT operates; contractors as tenants; admin team as cross-tenant operators |

**Product flows**

| Topic | File | Summary |
|-------|------|---------|
| Application flow | [docs/kb/application-flow.md](docs/kb/application-flow.md) | 13-step flow, two origination modes, two-part application split, loan checklist as a state |
| Partner & borrower experience | [docs/kb/partner-and-borrower-experience.md](docs/kb/partner-and-borrower-experience.md) | Two-sided experience, action ownership rules, handoff mechanics |
| Credit pulls | [docs/kb/credit-pulls.md](docs/kb/credit-pulls.md) | Soft/hard pull triggers mapped to application part 1 / part 2; consent capture per pull |
| Project completion and funding | [docs/kb/project-completion-and-funding.md](docs/kb/project-completion-and-funding.md) | Two-gate funding (partner attestation + borrower authorization), multi-channel authorization |
| Contractor onboarding | [docs/kb/contractor-onboarding.md](docs/kb/contractor-onboarding.md) | Onboarding data model, beneficial owners, activation gate |

**Lenders**

| Topic | File | Summary |
|-------|------|---------|
| Lender routing | [docs/kb/lender-routing.md](docs/kb/lender-routing.md) | Rules-based routing, prime-first prequal, MVP single-prime + fallback, soft-pull bypass for some products |
| Lender integration model | [docs/kb/lender-integration-model.md](docs/kb/lender-integration-model.md) | Per-lender variation, approval conditions, threshold-gated requirements, promotional programs |
| Loan documents and signing | [docs/kb/loan-documents-and-signing.md](docs/kb/loan-documents-and-signing.md) | Lender-owned signing, IDV/compliance rationale for keeping it out |

**Tech stack**

| Topic | File | Summary |
|-------|------|---------|
| Tech stack | [docs/kb/tech-stack.md](docs/kb/tech-stack.md) | Headline choices: .NET 8, React+TS, Postgres, Auth0, DO App Platform, GitHub Actions, Serilog, Datadog |
| Application architecture | [docs/kb/tech-stack/application-architecture.md](docs/kb/tech-stack/application-architecture.md) | Layered .NET solution, EF Core, MediatR, monolith-first, frontend-in-wwwroot |
| Mobile and PWA | [docs/kb/tech-stack/mobile-and-pwa.md](docs/kb/tech-stack/mobile-and-pwa.md) | Mobile-first, vite-plugin-pwa (InjectManifest), Bubblewrap TWA for Android, Capacitor iOS deferred |
| Authentication | [docs/kb/tech-stack/authentication.md](docs/kb/tech-stack/authentication.md) | Auth0 for platform users + one-time-URL flow for borrowers, WorkOS as documented fallback |
| Infrastructure & deployment | [docs/kb/tech-stack/infrastructure-and-deployment.md](docs/kb/tech-stack/infrastructure-and-deployment.md) | Multi-stage Dockerfile, DO App Platform, GitHub Actions, environments, secrets |
| Observability | [docs/kb/tech-stack/observability.md](docs/kb/tech-stack/observability.md) | Serilog, correlation IDs, DO log forwarding to Datadog, audit-log boundary |

**Scope & posture**

| Topic | File | Summary |
|-------|------|---------|
| MVP scope | [docs/kb/mvp-scope.md](docs/kb/mvp-scope.md) | What's in MVP, what's deferred, timeline, follow-up materials owed |
| Compliance | [docs/kb/compliance.md](docs/kb/compliance.md) | Facilitator posture, security/auditability/retention design discipline |
| Clean-room rules | [docs/kb/clean-room-rules.md](docs/kb/clean-room-rules.md) | IP-driven constraint on legacy artifact use |

**Open questions**

| Topic | File | Summary |
|-------|------|---------|
| Open questions | [docs/kb/open-questions.md](docs/kb/open-questions.md) | Pending items with working assumptions or gaps awaiting business-team input |
