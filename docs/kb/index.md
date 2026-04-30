# Optimus Knowledgebase

This index maps all knowledge topics maintained for the Optimus rewrite. Read the relevant topic file when working on related systems. New topics get added here when a concept needs deeper treatment than `CLAUDE.md` provides.

## Topics

### Product & flow
- [domain-glossary.md](domain-glossary.md) — Actor roles and key terminology
- [application-flow.md](application-flow.md) — End-to-end consumer flow, 13 steps; two origination modes; two-part application split; loan checklist as a state
- [partner-and-borrower-experience.md](partner-and-borrower-experience.md) — Two-sided experience model, action ownership, handoff mechanics
- [project-completion-and-funding.md](project-completion-and-funding.md) — Two-gate funding (partner attestation + borrower authorization), multi-channel authorization
- [contractor-onboarding.md](contractor-onboarding.md) — Onboarding data model, beneficial owners, activation gate

### Routing & lender integration
- [lender-routing.md](lender-routing.md) — Rules-based routing inputs and tier logic
- [lender-integration-model.md](lender-integration-model.md) — Lender abstraction and per-lender variation
  - [lender-integration-model/adapter-architecture.md](lender-integration-model/adapter-architecture.md) — Adapter pattern, canonical model, single webhook ingestion, in-process deployment
- [credit-pulls.md](credit-pulls.md) — Soft pull at prequal, hard pull at full app
- [loan-documents-and-signing.md](loan-documents-and-signing.md) — Lender-owned signing flow

### Scope, posture, references
- [mvp-scope.md](mvp-scope.md) — MVP features, deferred items, timeline
- [ownership-and-tenancy.md](ownership-and-tenancy.md) — Optimus owns deployment, DRT operates; contractors as tenants, admin team as cross-tenant operators
- [compliance.md](compliance.md) — Facilitator posture, security/audit/retention discipline
- [clean-room-rules.md](clean-room-rules.md) — IP-driven rules on legacy artifact use

### Architecture & tooling
- [tech-stack.md](tech-stack.md) — Backend, frontend, database, hosting, CI/CD, observability — the headline choices and why
  - [tech-stack/application-architecture.md](tech-stack/application-architecture.md) — Layered .NET solution, EF Core, monolith-first, frontend-in-wwwroot
  - [tech-stack/infrastructure-and-deployment.md](tech-stack/infrastructure-and-deployment.md) — Docker, DO App Platform, GitHub Actions, environments, secrets
  - [tech-stack/observability.md](tech-stack/observability.md) — Serilog, Datadog log forwarding, correlation IDs, audit-log boundary
  - [tech-stack/authentication.md](tech-stack/authentication.md) — Auth0 for platform users + one-time-URL flow for borrowers
  - [tech-stack/mobile-and-pwa.md](tech-stack/mobile-and-pwa.md) — Mobile-first design, PWA via vite-plugin-pwa, Bubblewrap TWA for Android, Capacitor iOS deferred

## Sources

Most current content is distilled from kickoff materials and from extracted summaries of legacy reference artifacts. Future business-team deliverables (decision trees, lender-specific rules, status definitions, wireframes) will land under `docs/` and seed updates here.

## Conventions

### Navigation

Every topic file starts with a single back-link to its **immediate parent**, just above the H1:

```markdown
← [KB index](index.md)

# My Topic
```

For sub-topics, the parent is the parent topic, not the index:

```markdown
← [Parent Topic](../parent-topic.md)

# Sub-topic
```

To reach the index from a sub-topic: click the parent link, then the index link from the parent. Two clicks for a one-level-deep sub-topic — direct, predictable, no ambiguity about scope.

### Hierarchy

Sub-topics are for deeper detail, alternative perspectives, or specialized angles on a parent topic that don't fit cleanly inside the parent file. They live in a folder named after the parent topic file (without the `.md` extension):

```
docs/kb/
├── lender-routing.md            ← parent topic
└── lender-routing/              ← folder for sub-topics
    ├── routing-rules-detail.md
    └── multi-prime-strategy.md
```

When creating a sub-topic:

- Add the parent back-link as shown above.
- Link to the sub-topic from the parent topic's "Cross-References" section so it's discoverable.
- Add the sub-topic to this index — nest it under its parent in the topic list.

The hierarchy is intentionally shallow: most concepts should fit in a single topic file. Reach for sub-topics only when a topic has grown to where pieces are best read independently or where the parent is getting hard to scan.
