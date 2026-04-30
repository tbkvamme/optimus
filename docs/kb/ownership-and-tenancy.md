← [KB index](index.md)

# Ownership and Tenancy

Who owns the running Optimus platform, and how multi-tenancy is structured within it.

## Current State

Pre-implementation. Both the inter-party arrangement (Optimus and Digital Rain Tech) and the in-deployment tenancy model are locked at the level of intent captured here. Concrete details — exact contractual terms, the `tenant_id` schema, Auth0 Organizations setup, the admin role taxonomy — are deferred to the implementation plan.

The kickoff materials (`docs/references/meetings/kickoff.md`) framed "long-term ownership/control" and the legacy situation where "the platform owner does not fully control the IP, roadmap, integrations, or future development" as the strategic driver of the rewrite. The model documented here is the response.

## Two-party platform ownership

Two parties:

- **Optimus** — the platform owner. The customer-facing brand, holder of contractor and lender relationships, decision-maker on roadmap.
- **Digital Rain Tech (DRT)** — the technology partner / operator. Builds and runs the platform on Optimus's behalf.

### The choice

**Optimus owns the deployment, the database, and the source-code repository. DRT operates the platform for a fee.**

What Optimus owns concretely:

- The DigitalOcean cloud account, the App Platform project, the Container Registry, and the managed Postgres instance.
- The deployed binaries and signing keys.
- All customer data — applications, borrowers, contractor records, audit logs, etc.
- The source-code repository (this repo).
- All third-party API integrations registered to Optimus's accounts (Auth0 tenant, Datadog account, lender API credentials).

What DRT does:

- Ongoing development against Optimus's roadmap.
- Operations: deploys, incident response, on-call.
- Change requests scoped by contract.

### Why not the white-label SaaS / Optimus-as-tenant-of-DRT model

DRT could plausibly offer this same product as a white-label SaaS, with Optimus as one tenant alongside other lender-platform operators (other countries, other lender ecosystems). **That model is rejected.** It would substitute one technology dependency (the legacy lender-owned platform) with another (DRT's platform), and Optimus's control would erode as DRT's tenant base grows — roadmap priorities, feature trade-offs, and operational attention would have to be balanced across tenants Optimus has no relationship with. The whole point of the rewrite is escaping that situation.

Owning the deployment is more expensive than being a SaaS tenant, but the kickoff explicitly named "Full ownership and control of the new platform" as a strategic priority. The cost is justified.

### The split-codebase risk

DRT remains free to pursue other clients. If a future client's requirements diverge meaningfully from Optimus's, two paths exist:

1. **Keep the codebase shared, expressing differences as configuration.** The longer this holds, the longer Optimus benefits from shared engineering investment. The cost is reduced independence on feature-shape disagreements — Optimus can't unilaterally remove a code path that another client depends on.
2. **Fork the codebase per client.** Full independence, but DRT carries 2× maintenance burden, which probably becomes Optimus's problem indirectly through pricing.

This is documented as an acknowledged risk, not a designed-around concern. Path (1) is the better default; path (2) is the escape hatch when (1) becomes untenable. The "configuration over code" discipline established in [adapter-architecture.md](lender-integration-model/adapter-architecture.md) for lender variation applies here too: the more variation lives as data, the longer (1) holds.

## Multi-tenancy within the Optimus deployment

The platform serves many contractor merchants. Each is a **tenant** with isolated data; the Optimus admin team operates above the tenant layer with role-gated cross-tenant access.

### Actors revisited as tenancy roles

The four actor roles from [domain-glossary.md](domain-glossary.md), expressed in tenancy terms:

| Actor | Tenancy role |
|---|---|
| Contractor / merchant | **A tenant.** One contractor company = one tenant. Sales reps and other employees are users *within* that tenant. Tenants are jurisdiction-bound — a tenant operates in U.S. *or* Canada, never both simultaneously |
| Homeowner / borrower | **Not a tenant.** A borrower is scoped to one application within one tenant. No cross-tenant borrower identity. Consistent with the borrower-as-non-account model in [tech-stack/authentication.md](tech-stack/authentication.md) |
| Lender | **Not a tenant.** Lenders are platform-level integrations. The lender catalog and routing rules are shared across tenants; routing decides which lender a given borrower goes to |
| Optimus admin team | **Cross-tenant operator.** Sits above the tenant layer with role-gated access — *not* blanket superuser. Specific roles (e.g., `admin:support`, `admin:integration`, `admin:finance`) each have defined scopes |

### The Optimus admin team is role-gated, not blanket superuser

"Cross-tenant operator" doesn't mean every admin team member sees everything. The intent is a role taxonomy where each admin-side role has a specific cross-tenant scope:

- A **support** role might read tenant data and resolve flagged applications, but not approve compliance gates or access raw lender API credentials.
- An **integration** role might write to tenant configuration and lender adapter settings but not read borrower PII.
- A **finance** role might query funding and payout records but not modify application state.

The exact role grid is **deferred to the implementation plan**, but the principle — least privilege per role, not blanket access — is locked.

### What's per-tenant vs. platform-level

| Per-tenant | Platform-level |
|---|---|
| Applications, borrowers, loans | Lender catalog and adapter code |
| Contractor record + beneficial owners | Routing rules |
| Sales-rep / contractor user accounts | Optimus admin team accounts |
| Tenant-specific configuration (branding, default plans, communication templates) | Audit-log infrastructure (the table and pipeline are platform-wide; rows are tenant-tagged) |
| Document uploads, communication records | Webhook ingress endpoint |
| One-time URLs issued to borrowers (always within a single tenant) | Auth0 tenant (the Auth0-infrastructure container, distinct from business tenants) |

Per-tenant data is tagged with a `tenant_id` and accessed only in tenant context. Platform-level data is not tenant-scoped.

## What this means for the data model

Principles only — concrete schema is in the implementation plan.

- **Every business table has a `tenant_id` from the first migration.** Retrofitting tenancy is famously expensive; making it ambient from Day 1 is much cheaper than adding it later.
- **Application code receives tenant context implicitly**, typically via middleware that resolves the tenant from the authenticated user's claims and exposes it as an ambient `TenantContext`. Handlers don't parameterize on `tenant_id` explicitly — they query through repositories that already know the current tenant.
- **Cross-tenant queries are the exception, not the default.** They're gated by an explicit `admin:` role check, and every cross-tenant access produces an audit-log entry.
- **Audit logs are tenant-tagged.** A regulator request or contractor dispute filters audit-log rows by tenant and time range; the underlying audit-log infrastructure (pipeline, storage) is platform-wide.

## Key Decisions & Rationale

### Optimus owns the deployment, DRT operates it

**Why:** Independence and control are strategic drivers per the kickoff. The white-label SaaS alternative would substitute one technology dependency for another, and Optimus's control would erode as DRT's tenant base grew.

**How to apply:** When making technology choices, prioritize options Optimus can take with them if the relationship with DRT ends. Cloud accounts, repos, and credentials live with Optimus. Avoid technology choices that bind Optimus to DRT specifically (proprietary frameworks, DRT-hosted services that don't map cleanly to standard cloud equivalents).

### Multi-tenant from Day 1, not retrofitted

**Why:** Adding tenancy to an existing schema is one of the most expensive refactors a SaaS-style platform can undertake. Even if MVP launches with only a handful of contractor tenants, the cost of `tenant_id` from the start is trivial compared to the cost of adding it later.

**How to apply:** Every new business table starts with `tenant_id` and a non-null constraint. Repositories and queries flow through `TenantContext`. There is no "add tenancy in v2" milestone.

### Contractors are the tenants

**Why:** Contractors are the legal-entity unit at which Optimus's customer relationship sits. They have beneficial owners (already modeled in [contractor-onboarding.md](contractor-onboarding.md)), pay or receive funds, and originate applications. Sales reps are employees of a contractor; regional offices are organizational details inside a contractor. No other actor is the natural tenant boundary.

**How to apply:** When asking "is this scoped to one contractor?", the answer is almost always yes — and that answer makes it tenant-scoped. The exceptions (lenders, routing rules, admin accounts) are platform-level by design.

### Admin team is role-gated, not blanket superuser

**Why:** Compliance and least-privilege both demand it. A platform that handles borrower PII and lender API credentials cannot grant blanket cross-tenant access to every admin user.

**How to apply:** Each admin-side role has a defined cross-tenant scope. Adding a new admin-side capability means defining what role grants it and what data the role can touch. Cross-tenant access is audit-logged.

### Configuration over code as the codebase-split mitigant

**Why:** If DRT signs another client whose requirements diverge from Optimus's, the practical question is *how much divergence* the shared codebase can tolerate. The more variation lives as configuration, the more divergence the shared codebase tolerates before forking.

**How to apply:** When implementation choices come up, prefer the data-driven shape over the code-branched shape, even when the code-branched shape is faster to write today. The cost shows up later, when DRT's other-client requirements would have forced a fork that the configuration approach avoids.

## Known Limitations

- The exact contractual terms between Optimus and DRT (fee structure, change-request scoping, exit clauses, IP escrow, what happens to the deployment if the relationship ends) are TBD and not described here. This topic captures the operational model, not the contract.
- The admin-side role taxonomy is illustrative — the names `admin:support`, `admin:integration`, `admin:finance` are placeholders. The real grid lands in implementation.
- Per-tenant configuration primitives (what's actually configurable per tenant — branding, default plans, communication templates, etc.) will emerge during the first contractor-onboarding implementation.
- Sub-tenants are not modeled. A contractor with multiple branches or franchises is one tenant in MVP, with sales-rep accounts representing the people involved.
- "Tenants are jurisdiction-bound" assumes no contractor operates in both U.S. and Canada in MVP. If a contractor genuinely operates in both, the implementation plan needs to revisit (likely two tenants for the same legal entity, one per market).

## Deferred / Future

- Concrete `tenant_id` column schema and migration.
- EF Core query-filter pattern; automatic tenant-stamping in `AppDbContext.SaveChanges`.
- `TenantContext` middleware and ambient resolution.
- Auth0 Organizations setup: how each contractor tenant maps to one Auth0 Organization, how users get assigned, how the admin team has cross-organization access via dedicated roles.
- Detailed admin role taxonomy and permission grid.
- Tenant-aware audit-log queries and tenant-scoped exports for regulator requests.
- Sub-tenants / franchises / regional sub-companies, if a real use case emerges.
- Multi-region deployment (separate U.S. and Canadian instances if regulatory or latency reasons demand it — not in MVP).
- A "tenant administrator" role *within* a contractor tenant (a contractor user who can manage their own organization's sales reps).

## Cross-References

See also: [mvp-scope.md](mvp-scope.md), [compliance.md](compliance.md), [clean-room-rules.md](clean-room-rules.md), [domain-glossary.md](domain-glossary.md), [contractor-onboarding.md](contractor-onboarding.md), [partner-and-borrower-experience.md](partner-and-borrower-experience.md), [tech-stack/authentication.md](tech-stack/authentication.md), [tech-stack/application-architecture.md](tech-stack/application-architecture.md), [lender-integration-model/adapter-architecture.md](lender-integration-model/adapter-architecture.md).
