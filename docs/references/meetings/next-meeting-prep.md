# Next Meeting — Preparation

Topics, questions, and working assumptions to validate or clarify with the platform/business team at the next meeting (date TBD). New questions get appended here as they surface during planning, KB drafting, or design work.

## How to use this document

- Items here are **open questions** where the rewrite team is currently making working assumptions but needs confirmation from the business / platform owners.
- After the meeting, items get either **resolved** (merged into the relevant KB topic with the agreed decision) or **dropped** (no longer relevant).
- Stack-rank questions roughly by how much downstream design depends on the answer — the higher up, the more painful it'd be to find we'd guessed wrong.
- When adding a question, include: the **working assumption**, the **why** behind it, **what we need from the business team**, and **where it shows up** in the KB or in CLAUDE.md so we know what to update once the answer lands.

## Open questions

### 1. Data migration from the legacy system — confirm "none"

**Working assumption:** the new platform never imports data from the legacy Optimus. Legacy keeps servicing its existing loans until they wind down naturally; the new platform handles only new originations from cutover onward. No ETL, no schema-mapping utility, no "import existing customers" feature.

**Why we're assuming this:** consistent with the clean-room rewrite stance ([clean-room-rules.md](../../kb/clean-room-rules.md)) and the IP-ownership theme from the kickoff. Pulling legacy data would re-couple Optimus to legacy schemas and to the legacy partner's tech — exactly what the rewrite is trying to break free from. Operationally, legacy can keep servicing its existing book of loans until those loans amortize and the legacy system is wound down; the cutover is for new business only.

**What we need from the business team:**

- Confirm the assumption: zero data migration from legacy. OR
- If some data must come across: what subset (contractors? in-flight applications? funded loans?), what source-system access we'd need, and the timing relative to the 2027 production cutover.
- Either way: confirm what "the legacy continues until it winds down" means operationally — is there a sunset date, or does it run until the last loan is paid off?

**Where this shows up if the answer changes:**

- [docs/kb/mvp-scope.md](../../kb/mvp-scope.md) — Timeline section and the "No data migration from legacy" Key Decision.
- [CLAUDE.md](../../../CLAUDE.md) — production-timeline paragraph in MVP scope / timeline.
- Project memory `project_no_data_migration_from_legacy.md`.
- Any future feature scope that might otherwise quietly assume legacy data is available (e.g., contractor onboarding pre-fill, loan-history features).

### 2. What does "MVP" actually include — platform-only, or end-to-end with at least one lender?

**The ambiguity:** the kickoff timeline says *"MVP by end of summer 2026, ideally ready to begin lender API integration work by then."* But the kickoff's MVP scope list also includes *"Single prime lender + defined fallback routing logic."* These two are hard to reconcile: you can't have a working end-to-end MVP without at least one lender integrated, but the timeline language treats lender API integration as something that *begins* at MVP-ready, not something that's part of MVP.

**Two readings, very different implications:**

1. **Platform-only MVP.** By end of summer 2026, the platform is fully built (UIs, application state machine, contractor dashboard, partner/borrower experience, project completion flow) but **no lender is integrated yet**. Lender integration work starts after MVP-ready and takes 30–60 days per lender per the kickoff's own estimate. The first real loan can't flow through the new platform until ~late 2026 or into 2027.
2. **End-to-end MVP.** By end of summer 2026, the platform plus the first lender integration is working end-to-end. The "begin lender API integration work by then" language refers to *additional* lenders beyond the first (the fallback, then future lenders). Implication: lender API integration work would need to start well before end of summer 2026 to be done by then.

**What we need from the business team:**

- Confirm which reading is correct — or a third we haven't enumerated.
- If Reading 1: when does the first real loan flow through the new platform? Is "production in 2027" the answer, or is there an earlier first-loan milestone we should be planning toward?
- If Reading 2: lender API integration work needs to start meaningfully before end of summer 2026. When does that work need to start, and which lender is the target?
- Either way: clarify whether the *"Single prime lender + defined fallback"* item is in-scope-for-MVP or in-scope-for-production-cutover (which differ by months).

**Where this shows up if the answer changes:**

- [docs/kb/mvp-scope.md](../../kb/mvp-scope.md) — "In MVP" list (the lender-routing item) and the Timeline section both need to align with whichever reading the business team confirms.
- [docs/kb/lender-integration-model/adapter-architecture.md](../../kb/lender-integration-model/adapter-architecture.md) — the "build first, abstract second" guidance assumes lender integration is real engineering work; the sequencing of when that work starts depends on the answer.
- [CLAUDE.md](../../../CLAUDE.md) — production-timeline paragraph in MVP scope.
