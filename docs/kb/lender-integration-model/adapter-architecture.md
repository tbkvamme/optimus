← [Lender Integration Model](../lender-integration-model.md)

# Lender Adapter Architecture

How Optimus integrates with multiple lenders without a per-lender code explosion. Sub-topic of the [parent](../lender-integration-model.md), which describes **what** varies per lender and the abstraction goal; this topic describes **how** the architecture realizes that goal.

## Current State

Pre-implementation. Architecture described at the contract / interface level — language- and framework-agnostic, so the eventual tech-stack choice can implement it without architectural rewrites.

## How It Works

![Lender adapter architecture — three layers (Optimus core / adapters / lender APIs) with a common contract between core and adapters, single webhook ingress at the bottom routing inbound events to the matching adapter, and the adapter contract methods listed on the right](../diagrams/lender-adapter-architecture.png)

*Source: [../diagrams/lender-adapter-architecture.excalidraw](../diagrams/lender-adapter-architecture.excalidraw)*

### Three layers

1. **Optimus core** — operates on a canonical internal model (application, loan, contractor, homeowner, status, event). Knows nothing about specific lenders; calls into adapters via a common interface.
2. **Lender adapter** — one per lender. Implements the common adapter contract. Translates between the canonical model and the lender's specific API + webhook surface. Lives **in-process** as a module in the main Optimus app — see "Adapter deployment" below.
3. **Lender's own surface** — REST / GraphQL / SOAP / whatever each lender exposes, plus their webhooks, plus any out-of-band channels (call centers, document portals, etc.). Opaque to Optimus core.

### Two integration surfaces per adapter

Each lender adapter has two halves:

**Outbound API client** (Optimus → Lender):

- Submit application (Part 1, Part 2)
- Submit project completion data
- Trigger document signing flow
- Upload supporting documents (income proofs, banking, etc.)
- Resolve approval conditions (post evidence to clear hourglass holds)

**Inbound webhook handler** (Lender → Optimus):

- Decision events — approved / declined / approved-with-conditions
- Status transitions per Loan Checklist sub-step
- Approval conditions added / cleared
- Document-signing status (sent / viewed / signed / declined)
- Funds-released event

### Adapter contract (sketch, language-agnostic)

```
LenderAdapter:
  // Outbound — called by Optimus core
  submit_application(canonical_app: Application) → LenderAck
  submit_project_completion(loan_id: LoanId, data: CompletionData) → LenderAck
  trigger_document_signing(loan_id: LoanId) → LenderAck
  upload_document(loan_id: LoanId, type: DocType, content: Bytes) → LenderAck
  resolve_approval_condition(loan_id: LoanId, condition_id: ConditionId, evidence: Bytes) → LenderAck

  // Inbound — called by the framework when a webhook arrives
  parse_webhook(raw: Bytes, signature: String) → InternalEvent
  //   InternalEvent is a canonical event:
  //   DecisionMade, StatusChanged, ConditionAdded, ConditionCleared,
  //   DocumentSigned, FundsReleased, ...
```

The contract is the firewall between Optimus core and lender specifics. Adding a new lender = implementing this contract. Removing a lender = deleting an adapter.

## Configuration over code

Where lender variation can be expressed as data, **prefer data**. Goal: a "normal" new lender adapter is ~80% configuration plus a thin code shim. Lenders with proprietary mechanics will skew higher on code.

**Per-lender config (data, not code):**

- Status taxonomy mapping — lender's status names → internal canonical statuses
- Field requirements — which fields the lender needs in the full application, with required/optional flags
- Threshold rules — e.g., the income-verification credit-limit cutoff
- Promotional-program catalog — per-program economics, partner cost, eligibility rules
- Disclosure / IDV / proof-of-X requirements per loan type
- Webhook event-type → canonical event mapping
- API endpoints, auth scheme, rate limits, retry policy

**Per-lender code (genuinely lender-specific):**

- Bespoke auth handshakes that don't fit standard OAuth / API-key / HMAC patterns
- Exotic data formats or non-standard transports
- Anything truly idiosyncratic that the config layer can't express cleanly

The discipline: when a new lender requires an unexpected piece of code, ask whether that capability could be expressed as a new config primitive instead. Accumulate config power slowly; let the code layer stay thin.

## Webhook ingestion: single endpoint with internal routing

All lender webhooks arrive at a **single ingestion endpoint** in Optimus. The framework inspects each incoming request — by URL path segment, by header, by signature scheme, or by payload shape — and routes it to the correct lender adapter's `parse_webhook` method.

**Why single (not per-lender):**

- Fewer DNS records, less per-environment URL coordination with lenders.
- Centralized logging, signature verification, dedup, and dead-letter handling.
- Adding a new lender doesn't require a new public endpoint — just a new internal route entry.

**What the framework does before handing off to the adapter:**

1. Persist the raw payload to the audit log — every webhook recorded, before any other processing.
2. Verify the signature using the per-lender secret (config-driven).
3. Deduplicate by event ID for idempotency.
4. Acknowledge receipt to the lender quickly, then process asynchronously.

The adapter sees a clean parsed event and produces an `InternalEvent` that Optimus core can consume.

## Adapter deployment: in-process modules

Lender adapters are **modules in the main Optimus app** — not separate microservices. For MVP, this is the simpler choice:

- One deployment surface, one set of secrets, one observability stack.
- Low ops overhead.
- Adapters share the in-app database / event bus directly, no inter-service plumbing.

The adapter contract is the same regardless of deployment shape, so a future move to per-lender services — if scale or isolation demands it — would be a deployment refactor, not an architectural rewrite.

## Cross-cutting concerns

These belong to the framework that adapters plug into, not to each adapter individually. Adding a new lender shouldn't require re-implementing any of them.

- **Idempotency** — webhook deliveries can repeat (network blips, lender retry policies). Deduplicate by event ID before invoking adapter logic.
- **Outbound retries** — exponential backoff with jitter for transient failures, dead-letter queue for unrecoverable failures, surface in the contractor dashboard when a live loan is affected.
- **Audit trail** — every outbound call and inbound event recorded: timestamp, lender, loan ID, raw payload, outcome. See [compliance.md](../compliance.md) for the broader audit posture.
- **Sandbox / testing** — every adapter ships with a mock/sandbox mode so end-to-end flows can be exercised without hitting prod lender APIs. Critical for new-lender onboarding velocity and ongoing regression testing.
- **API versioning** — adapters pin to a specific lender API version. Upgrading is a new adapter version, not a live mutation. Lender-side breaking changes don't silently break Optimus.
- **Secrets management** — per-lender API credentials live in a secrets manager, not config files. Rotated independently of code deploys.

## Build first, abstract second

The biggest risk with this kind of architecture is **premature abstraction**: imagining what's common across lenders before any real lenders are integrated, then getting the abstraction exactly right for the imagined lender and exactly wrong for everyone else.

**Avoid this by:**

- Building the **first** lender adapter without trying to abstract. Let it be lender-specific, no shared framework yet.
- When adding the **second** lender, refactor the genuinely-common parts up into a shared adapter framework. Resist abstracting anything that isn't *actually* common across both.
- Treat this topic's architecture as a **target**, not a day-one scaffold.

The MVP single-prime + fallback gives us exactly two lenders — the minimum viable amount of variation to drive a useful abstraction. With one lender the "framework" is fiction; with two it's evidence-based.

## Key Decisions & Rationale

### Adapter pattern + canonical internal model

**Why:** The kickoff cited 30–60 days as the current per-lender integration cost and called this a commercial bottleneck (revenue scaling depends on lender-onboarding throughput). Without an abstraction, every new lender is greenfield. The canonical-model-with-adapters pattern is the standard answer to "integrate with N variations of the same conceptual thing" and has decades of track record across payment processors, identity providers, messaging platforms, etc.

### Configuration over code

**Why:** Config changes don't require redeploys, are easier to audit, and (eventually) let non-engineers onboard new lenders. The 30–60-day target shrinks dramatically when most per-lender work is filling in config rather than writing code.

### In-process modules for MVP

**Why:** Microservices add ops overhead — deployment pipelines, service discovery, distributed tracing, separate observability — that doesn't earn its keep at MVP scale. With one prime + one fallback, a monolith handles the load fine. Re-evaluate when scale or team size makes service isolation worthwhile.

### Single webhook ingestion endpoint

**Why:** Fewer moving parts, centralized signature verification and dedup, no per-lender DNS coordination. Internal routing by URL path / header / signature is a small dispatch table — not enough complexity to justify multiple public endpoints.

### Build first, abstract second

**Why:** Premature abstraction is a more expensive mistake than the duplicated code that abstraction-second creates. Two lenders is the minimum to refactor against; one lender is fiction. Spend the engineering budget on the first integration's correctness, then refactor with evidence.

## Known Limitations

- The canonical internal model — `Application`, `Loan`, `Status`, `InternalEvent`, etc. — is TBD. Definitions will emerge as the first lender integration is built and the second is brought online.
- Specific lender API documentation hasn't been gathered yet (kickoff: "API information where available" is on the follow-up list).
- The boundary between "config" and "code" in the adapter is a judgment call; the right shape will emerge from the first two integrations.
- Async processing details (message queue, event bus, background worker pool, etc.) are tech-stack-dependent and not specified here. The architecture assumes they exist.

## Deferred / Future

- **Self-service lender onboarding** — a config-only onboarding path where adding a "normal" new lender doesn't require a developer at all.
- **Lender capability matrix** — an admin UI surfacing which features each lender supports (soft pull, signing, threshold rules) for routing decisions and customer-support visibility.
- **Adapter SDK / templates** — accelerator for new adapter implementations once 3+ lenders are integrated and patterns have stabilized.
- **Sandbox harness UI** — manual way to exercise an adapter against a mock lender for QA, lender-side debugging, and training.
- **Per-lender services** — break adapters out into separate deployments if scale or isolation demands it.

## Cross-References

See also: [lender-integration-model.md](../lender-integration-model.md), [lender-routing.md](../lender-routing.md), [credit-pulls.md](../credit-pulls.md), [loan-documents-and-signing.md](../loan-documents-and-signing.md), [project-completion-and-funding.md](../project-completion-and-funding.md), [compliance.md](../compliance.md).
