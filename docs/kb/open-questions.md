← [KB index](index.md)

# Open Questions

Open items pending business-team input. For each: either the working assumption the rewrite team is currently making, or the gap we can't fill from inside the team; what we need to resolve it; and where the answer shows up if it changes.

## Lifecycle

Items here are **pre-decision** — captured so working assumptions are visible rather than implicit, and so the downstream surfaces affected by each answer are pre-traced.

When an answer lands:

- **Resolved** — merge the agreed decision into the relevant KB topic(s) and remove the item from this file.
- **Dropped** — the question is no longer load-bearing; remove without merging.

New items get appended as they surface during planning, KB drafting, or design work. Roughly stack-ranked by how much downstream design depends on the answer — the higher up, the more painful it would be to discover we'd guessed wrong.

## 1. Third-party integrations needed by the business features

**The gap:** the rewrite team doesn't have visibility into which third-party APIs the platform's **business features** need to integrate with. The business team holds this knowledge — which lenders, which credit bureaus, which IDV / KYB / e-signature / banking-verification / messaging providers, etc., the consumer flow and the contractor flow actually require. Without that list, MVP timing and the boundary between Optimus-owned vs. lender-owned responsibilities are unknowns.

**Scope of this question — business features only.** This question covers third parties that exist because a *business feature* needs them (the prime lender, a credit bureau, an IDV provider, an e-signature service, etc.). Infrastructure and tooling choices (database, hosting, logging, file storage, error tracking, product analytics, etc.) are rewrite-team decisions and are **not** in scope here — please don't list those.

**What we need from the business team — for each integration:**

1. **Name** of the third party.
2. **API(s)** the platform needs to call.
3. **Why** — which business feature drives the integration; what would be missing without it. ("We integrate with X because they are the prime lender, and because they handle e-signatures for the loan documents," for example.)
4. **MVP-required or post-MVP** — does the platform need this for the first end-to-end loan, or is it for a later business feature? "Unknown" is a fine answer where it really is.
5. **Contacts** at the third party (account manager, integration support, legal, etc.).
6. **Contract / credentials status** — already in place? in-flight? not yet started? do we need the business team to open the dialog?
7. **Sandbox access path** — can the rewrite team get sandbox credentials before legal closes, or is everything contract-gated?
8. **US / Canada coverage** — both jurisdictions, US-only, Canada-only? (Optimus is dual-market.)
9. **Compliance prerequisites the vendor imposes** — SOC 2, PCI, specific contractual posture the vendor demands before they'll connect us.
10. **Webhook support** — push or pull? webhook signing? replay protection?

**Cross-cutting questions:**

- **Do existing legacy vendor contracts carry across to Optimus?** Given the break from the legacy partner, some vendor relationships likely need to be re-contracted in Optimus's name even where the vendor itself stays the same. Which vendors carry over, which need re-contracting, which should we replace?
- **Who at the business team owns each vendor relationship** for integrations that already exist? For vendors not yet picked, who has decision authority — Optimus business team, DRT, or joint?
- **Which integrations are gated on Optimus achieving a specific compliance posture** (SOC 2 in particular)? This affects whether SOC 2 needs to be on the MVP critical path or can come later.

**Where this shows up if the answer changes:**

- [mvp-scope.md](mvp-scope.md) — "In MVP" / "Out of MVP" lists expand to name the MVP-required vs. post-MVP integrations explicitly.
- [lender-integration-model.md](lender-integration-model.md) — answers about IDV, KYB, and similar boundary questions shift what lives behind the lender boundary vs. as a separate Optimus integration.
- [compliance.md](compliance.md) — if any vendor demands SOC 2 (or equivalent) as a prerequisite, that affects when compliance work has to start.
- A new sub-topic under [tech-stack/](tech-stack/) (e.g., `tech-stack/external-integrations.md`) once the list is concrete enough to document standalone.

## 2. Status of business-team deliverables owed since kickoff

**The gap:** the kickoff committed the business team to a set of follow-up materials that the rewrite team needs in order to design the platform. The list is captured in [mvp-scope.md](mvp-scope.md) under "Follow-up materials owed by the business team." The rewrite team is currently working in their absence, surfacing working assumptions across the KB as gaps appear.

**What we need from the business team — for each item below:**

For each of the following deliverables, confirm: who owns it, what's its current state (not-started / in-progress / available-but-not-yet-shared / delivered), and when can we expect it.

- Click-through demos or wireframes
- Application flow examples
- Business rules
- Decision trees
- Lender routing logic
- MVP feature list
- Lender-specific requirements
- Known pain points
- API information where available
- Status definitions
- Documentation for contractor onboarding
- Any requirements not currently in the existing Optimus platform

**Why we're asking now:** without these, the rewrite team is making working assumptions across every domain — routing logic, status taxonomy, contractor onboarding, lender adapter design. Knowing which deliverables are in-flight vs. unstarted vs. blocked lets us prioritize where to keep guessing and where to wait for confirmation.

**Where this shows up if the answer changes:**

- [mvp-scope.md](mvp-scope.md) — the "Follow-up materials owed by the business team" section grows a status / ownership / ETA column.
- Each KB topic touched by a delivered material updates as that material lands.
- Other items in this open-questions file may resolve as deliverables arrive (e.g., "Status definitions" likely answers the canonical-status-taxonomy gap once delivered).

## 3. Compliance frameworks

**The gap:** the rewrite team has documented the compliance posture as facilitator-not-lender ([compliance.md](compliance.md)) but has not enumerated the specific compliance frameworks that apply to Optimus, nor scoped what achieving them will take.

**What we need from the business team:**

- Which compliance frameworks does the business team know are relevant to Optimus?
- For each one, what's their assessment of what achieving and maintaining it will take?
- Are any of these prerequisites for first-lender connection or for scaling beyond MVP?

**Where this shows up if the answer changes:**

- [compliance.md](compliance.md) — the "Specific compliance frameworks" Known Limitation gets concrete framework-by-framework treatment.
- [mvp-scope.md](mvp-scope.md) — any framework that turns out to be a prerequisite becomes MVP-critical-path work.
- [tech-stack.md](tech-stack.md) and the tech-stack sub-topics — compliance-driven design constraints (audit logging, data residency, retention, encryption, access controls) land as concrete requirements once frameworks are named.

## 4. Data migration from the legacy system — confirm "none"

**Working assumption:** the new platform never imports data from the legacy Optimus. Legacy keeps servicing its existing loans until they wind down naturally; the new platform handles only new originations from cutover onward. No ETL, no schema-mapping utility, no "import existing customers" feature.

**Why we're assuming this:** consistent with the clean-room rewrite stance ([clean-room-rules.md](clean-room-rules.md)) and the IP-ownership theme from the kickoff. Pulling legacy data would re-couple Optimus to legacy schemas and to the legacy partner's tech — exactly what the rewrite is trying to break free from. Operationally, legacy can keep servicing its existing book of loans until those loans amortize and the legacy system is wound down; the cutover is for new business only.

**What we need from the business team:**

- Confirm the assumption: zero data migration from legacy. OR
- If some data must come across: what subset (contractors? in-flight applications? funded loans?), what source-system access we'd need, and the timing relative to the 2027 production cutover.
- Either way: confirm what "the legacy continues until it winds down" means operationally — is there a sunset date, or does it run until the last loan is paid off?

**Where this shows up if the answer changes:**

- [mvp-scope.md](mvp-scope.md) — Timeline section and the "No data migration from legacy" Key Decision.
- [CLAUDE.md](../../CLAUDE.md) — production-timeline paragraph in MVP scope / timeline.
- Any future feature scope that might otherwise quietly assume legacy data is available (e.g., contractor onboarding pre-fill, loan-history features).

## 5. Soft pull ownership and what the routing layer actually receives in MVP

**The ambiguity:** the KB says the soft credit pull is a **routing input** ([lender-routing.md](lender-routing.md): "Borrower credit profile (from soft pull at prequal)") and that the soft pull runs **before routing** ([credit-pulls.md](credit-pulls.md)). But it also says that **today the lender performs the soft pull** (specifically the prime lender), with Optimus-owned soft pull marked as a long-term target deferred past MVP. Those two facts can't both be true at the moment of the routing decision: if the lender owns the pull, the routing engine has no credit data when it picks a lender — only non-credit inputs (project category, state/province, product type, lender eligibility). The prime-first-prequal pattern is effectively the workaround: route to prime by non-credit inputs, let the prime's soft pull decide approve/decline, step down on decline. That works when there's one prime + one fallback (MVP), but it leaves the underlying contract between "routing" and "credit data" unspecified.

**Working assumption:** for MVP, Optimus does **not** own the soft pull. Routing operates on non-credit inputs only and uses the prime lender's soft-pull response as the trigger for stepping down to the fallback. The "credit profile" routing input documented in the KB is aspirational for the eventual Optimus-owned soft pull, not a real input that exists in MVP.

**Why we're assuming this:** the KB ([credit-pulls.md](credit-pulls.md), Key Decisions) explicitly defers Optimus-owned soft pull past MVP because of credit-bureau contracts and FCRA permissible-purpose work. And with one prime + one fallback, prime-first-prequal is a workable substitute — there's no real routing decision to make on credit data when there's only one prime to pick from.

**What we need from the business team:**

- Confirm: in MVP, is Optimus performing any soft credit pull at all, or is the soft pull entirely the prime lender's responsibility?
- If a borrower is declined by the prime lender, how does the fallback lender get to "knows the borrower's credit"? Two distinct operational models:
  1. **Optimus passes the prime's soft-pull result to the fallback** — requires the prime to share the bureau data with Optimus and the fallback to accept third-party-pull data. Better borrower UX, more contractual complexity.
  2. **The fallback lender does its own soft pull** — simpler contractually, but the borrower effectively gets pulled twice (still soft, no FICO impact, but more bureau hits and a slower flow).
- For products that **bypass soft pull entirely** (e.g., revolving credit cards, per [credit-pulls.md](credit-pulls.md) and [lender-routing.md](lender-routing.md)): how does routing decide a borrower belongs on a soft-pull-bypassing product without any credit signal at all? Is it purely a contractor-selected product type, a project-category implication, or something else?
- Longer-horizon: what's the rough timeline for Optimus owning the soft pull? Post-MVP-but-pre-production-cutover, or after production? This affects how seriously the abstraction layer needs to be designed in MVP vs. left as a TODO.

**Where this shows up if the answer changes:**

- [credit-pulls.md](credit-pulls.md) — the "How It Works" section needs the MVP operational model written out; the "Optimus owning the soft pull is a long-term target" Key Decision may need timeline detail.
- [lender-routing.md](lender-routing.md) — "Routing inputs" list currently includes "Borrower credit profile (from soft pull at prequal)"; if MVP routing has no credit input, the list needs to mark it as aspirational vs. MVP.
- [lender-integration-model/adapter-architecture.md](lender-integration-model/adapter-architecture.md) — the adapter contract may need a `share_soft_pull_result(...)` or equivalent if the prime-passes-to-fallback model is chosen.
- [CLAUDE.md](../../CLAUDE.md) — the "Soft pull ownership" deliberate-departure note already flags Optimus-owned soft pull as long-term target; the MVP operational reality should land here too.

## 6. What does "MVP" actually include — platform-only, or end-to-end with at least one lender?

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

- [mvp-scope.md](mvp-scope.md) — "In MVP" list (the lender-routing item) and the Timeline section both need to align with whichever reading the business team confirms.
- [lender-integration-model/adapter-architecture.md](lender-integration-model/adapter-architecture.md) — the "build first, abstract second" guidance assumes lender integration is real engineering work; the sequencing of when that work starts depends on the answer.
- [CLAUDE.md](../../CLAUDE.md) — production-timeline paragraph in MVP scope.

## Cross-References

See also: [mvp-scope.md](mvp-scope.md), [credit-pulls.md](credit-pulls.md), [lender-routing.md](lender-routing.md), [clean-room-rules.md](clean-room-rules.md), [lender-integration-model.md](lender-integration-model.md), [lender-integration-model/adapter-architecture.md](lender-integration-model/adapter-architecture.md), [compliance.md](compliance.md), [tech-stack.md](tech-stack.md).
