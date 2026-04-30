← [KB index](index.md)

# Lender Integration Model

How Optimus abstracts the differences between lenders so adding a new lender doesn't take 30–60 days.

## Current State

Pre-implementation. The abstraction goal is set; the abstraction itself is unwritten.

## What Varies Per Lender

The kickoff (section on Lender-specific differences) lists what each lender does differently:

- Application fields (full-application schema)
- Approval statuses
- Required disclosures
- Identity verification (IDV)
- Proof of income
- Proof of home ownership
- Stipulations (post-approval conditions)
- Loan document flow
- API structure (REST/GraphQL/SOAP/etc., auth, rate limits)
- Webhook status updates (event taxonomy, delivery guarantees, retry semantics)

## The 30–60-day pain point

Adding a new lender to the **current** platform takes approximately 30–60 days, depending on complexity. Most of that cost is per-lender bespoke integration work. The kickoff identified this as a key thing the rewrite needs to fix — Optimus's commercial expansion (target ~$1B/year) is bottlenecked by lender-onboarding throughput.

## Abstraction goal

The new platform should provide pluggable adapters per lender, fronting:

- **Application schema mapping** — a normalized internal application maps to lender-specific fields.
- **Status mapping** — lender-specific statuses map to an internal status taxonomy (TBD).
- **IDV / disclosure / proof-of-X handling** — varies per lender; should be data-driven where possible (lender config), not code-driven.
- **API client** — per-lender SDK boundary; isolates auth, retries, rate limiting.
- **Webhook handler** — per-lender webhook parser feeding into a normalized event stream.
- **Document flow trigger** — Optimus signals "send loan docs" to the lender; lender owns the rest. See [loan-documents-and-signing.md](loan-documents-and-signing.md).

The target is to move per-lender work toward configuration plus a thin adapter rather than greenfield integration code each time.

## Lender-side patterns the abstraction must surface

Three patterns observed across lenders that the backend must model — not just plumb through:

### Approval conditions are a first-class state

A loan can be **pre-qualified-with-conditions** — the lender's underwriting / operations team has specific items to review before funding can proceed. These conditions:

- Attach to specific Loan Checklist sub-steps (see [application-flow.md](application-flow.md)) or to the loan as a whole.
- Block contractor advancement on affected sub-steps until cleared.
- Are visible in the contractor's view of the loan (legacy used an hourglass icon affordance; the rewrite needs an equivalent).
- Resolve when the lender posts a condition-clear event back (typically via webhook).

The platform must:

- Receive approval-condition events from lenders (per-lender event format, normalized into an internal taxonomy).
- Surface them per-step in the loan checklist with clear "lender-reviewing" UX.
- Block forward progression of any sub-step that has unresolved conditions.
- Record condition-resolution events in the audit trail.

Approval-condition taxonomies vary by lender — part of the per-lender adapter.

### Threshold-gated requirements

Some Loan Checklist sub-steps appear conditionally based on the **approved credit limit** or other application attributes. For example, legacy required proof-of-income only when the credit limit exceeded a lender-set threshold. The platform must:

- Support per-lender, per-product threshold rules (driven by lender config, not hard-coded).
- Evaluate thresholds against the pre-qualification result to determine which sub-steps appear.
- Re-evaluate if the credit limit changes mid-flow (the legacy supports manual credit-limit adjustment).

### Promotional programs are partner-paid sales levers

Lenders typically offer promotional loan products — rate buy-downs, payment deferrals, same-as-cash periods, etc. — that the partner can apply to a specific loan **at a cost to the partner**. The backend must:

- Carry a per-loan program selection (default: standard / free; alternatives: priced promotional programs).
- Source the available program catalog per lender (so the partner sees only what the matched lender offers).
- Surface program economics to the partner with cost transparency at selection time (so they can decide whether to apply a promo program to win the deal).
- Carry partner-side cost accounting for promotional programs used (chargebacks/fees the partner owes the lender).

Promotional-program catalogs are per-lender — another aspect of the lender-adapter abstraction.

## Key Decisions & Rationale

### Abstraction is a commercial requirement, not just an aesthetic one

**Why:** With ~$500M/year today and a ~$1B/year target, lender-onboarding speed directly gates revenue. Tying down the integration cost is the difference between adding a few lenders a year and adding many.

## Known Limitations

- The internal application schema, status taxonomy, and event taxonomy are all TBD.
- Lender-specific API documentation has not yet been gathered (kickoff: "API information where available" is on the follow-up list).
- It is not yet known which lenders will be in MVP beyond the single prime + fallback.

## Deferred / Future

- Self-service lender configuration (no developer involvement to add a lender).
- Lender sandbox / test harness for new integrations.
- Lender capability matrix UI for admins.

## Sub-topics

- [adapter-architecture.md](lender-integration-model/adapter-architecture.md) — How the integration layer is shaped: canonical internal model, per-lender adapter contract, single webhook ingestion, in-process module deployment, build-first-abstract-second discipline.

## Cross-References

See also: [lender-routing.md](lender-routing.md), [application-flow.md](application-flow.md), [loan-documents-and-signing.md](loan-documents-and-signing.md), [credit-pulls.md](credit-pulls.md), [compliance.md](compliance.md).
