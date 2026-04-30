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

### 3. Soft pull ownership and what the routing layer actually receives in MVP

**The ambiguity:** the KB says the soft credit pull is a **routing input** ([lender-routing.md](../../kb/lender-routing.md): "Borrower credit profile (from soft pull at prequal)") and that the soft pull runs **before routing** ([credit-pulls.md](../../kb/credit-pulls.md)). But it also says that **today the lender performs the soft pull** (specifically the prime lender), with Optimus-owned soft pull marked as a long-term target deferred past MVP. Those two facts can't both be true at the moment of the routing decision: if the lender owns the pull, the routing engine has no credit data when it picks a lender — only non-credit inputs (project category, state/province, product type, lender eligibility). The prime-first-prequal pattern is effectively the workaround: route to prime by non-credit inputs, let the prime's soft pull decide approve/decline, step down on decline. That works when there's one prime + one fallback (MVP), but it leaves the underlying contract between "routing" and "credit data" unspecified.

**Working assumption:** for MVP, Optimus does **not** own the soft pull. Routing operates on non-credit inputs only and uses the prime lender's soft-pull response as the trigger for stepping down to the fallback. The "credit profile" routing input documented in the KB is aspirational for the eventual Optimus-owned soft pull, not a real input that exists in MVP.

**Why we're assuming this:** the KB ([credit-pulls.md](../../kb/credit-pulls.md), Key Decisions) explicitly defers Optimus-owned soft pull past MVP because of credit-bureau contracts and FCRA permissible-purpose work. And with one prime + one fallback, prime-first-prequal is a workable substitute — there's no real routing decision to make on credit data when there's only one prime to pick from.

**What we need from the business team:**

- Confirm: in MVP, is Optimus performing any soft credit pull at all, or is the soft pull entirely the prime lender's responsibility?
- If a borrower is declined by the prime lender, how does the fallback lender get to "knows the borrower's credit"? Two distinct operational models:
  1. **Optimus passes the prime's soft-pull result to the fallback** — requires the prime to share the bureau data with Optimus and the fallback to accept third-party-pull data. Better borrower UX, more contractual complexity.
  2. **The fallback lender does its own soft pull** — simpler contractually, but the borrower effectively gets pulled twice (still soft, no FICO impact, but more bureau hits and a slower flow).
- For products that **bypass soft pull entirely** (e.g., revolving credit cards, per [credit-pulls.md](../../kb/credit-pulls.md) and [lender-routing.md](../../kb/lender-routing.md)): how does routing decide a borrower belongs on a soft-pull-bypassing product without any credit signal at all? Is it purely a contractor-selected product type, a project-category implication, or something else?
- Longer-horizon: what's the rough timeline for Optimus owning the soft pull? Post-MVP-but-pre-production-cutover, or after production? This affects how seriously the abstraction layer needs to be designed in MVP vs. left as a TODO.

**Where this shows up if the answer changes:**

- [docs/kb/credit-pulls.md](../../kb/credit-pulls.md) — the "How It Works" section needs the MVP operational model written out; the "Optimus owning the soft pull is a long-term target" Key Decision may need timeline detail.
- [docs/kb/lender-routing.md](../../kb/lender-routing.md) — "Routing inputs" list currently includes "Borrower credit profile (from soft pull at prequal)"; if MVP routing has no credit input, the list needs to mark it as aspirational vs. MVP.
- [docs/kb/lender-integration-model/adapter-architecture.md](../../kb/lender-integration-model/adapter-architecture.md) — the adapter contract may need a `share_soft_pull_result(...)` or equivalent if the prime-passes-to-fallback model is chosen.
- [CLAUDE.md](../../../CLAUDE.md) — the "Soft pull ownership" deliberate-departure note already flags Optimus-owned soft pull as long-term target; the MVP operational reality should land here too.
