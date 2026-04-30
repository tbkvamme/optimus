← [KB index](index.md)

# MVP Scope

What's in MVP, what's deferred, the timeline, and the materials owed by the business team.

## Current State

Scope locked at the kickoff meeting. No code yet.

## In MVP

- **Single prime lender + defined fallback** routing logic (not the full multi-tier matrix). See [lender-routing.md](lender-routing.md).
- **Contractor onboarding** flow. See [contractor-onboarding.md](contractor-onboarding.md).
- **End-to-end consumer flow** through funding (the 13 steps in [application-flow.md](application-flow.md)), including project completion and homeowner funding authorization. See [project-completion-and-funding.md](project-completion-and-funding.md).
- **Contractor dashboard** with application status and loan progress: customer details, project address, application ID, lender, approval amount, current status, lender-event timeline, contact info, required next steps.
- **Mobile-first PWA**, installable on Android (pure browser PWA + optional Bubblewrap-generated TWA shell for Play Store presence). iPhone users still access the web PWA via Safari. See [tech-stack/mobile-and-pwa.md](tech-stack/mobile-and-pwa.md).
- **Clean, modern look and feel.**

## Out of MVP

- Multi-prime-per-product-category routing.
- Optimus-owned soft credit pull. See [credit-pulls.md](credit-pulls.md).
- Self-service lender configuration / sandbox / capability-matrix admin UI.
- Multi-language support (kickoff lists "language preference" as a borrower-side field but doesn't scope platform-side multi-language).
- Co-applicant flow detail beyond an optional field.
- **Native iOS app** (Capacitor + WKWebView shell) — adds Apple Developer Program, App Store review, iOS-specific Capacitor edge cases. iPhone users still get the web PWA via Safari in MVP. See [tech-stack/mobile-and-pwa.md](tech-stack/mobile-and-pwa.md).

## Architectural posture

- **Modular ("Lego") architecture**, standalone first.
- **Lender abstraction** designed to materially reduce the current 30–60-day per-lender integration cost. See [lender-integration-model.md](lender-integration-model.md).
- **Compliance posture:** facilitator, not lender; design for security, auditability, data retention from day one. See [compliance.md](compliance.md).
- **Tech stack** should not actively close the door on a future One Operations integration, but designing for that integration is out of scope. Tech-stack choice is the only place this constraint shows up — no further One Operations design work is in scope. The locked tech-stack decisions are documented in [tech-stack.md](tech-stack.md); .NET satisfies the One Operations constraint since Opus One Platform is .NET.

## Timeline

- **MVP** by end of summer 2026, ideally ready to begin lender API integration work by then. *(Internal tension: the MVP scope list above includes "single prime lender + defined fallback," which seems to require lender integration to be done by MVP — not starting at MVP. Queued for clarification with the business team — see [next-meeting-prep.md](../references/meetings/next-meeting-prep.md).)*
- **Production** in 2027. The new platform runs in **parallel** with the existing legacy Optimus: new loan originations cut over to the new platform, while legacy continues to service its existing loans until they wind down naturally. **Working assumption:** no data is imported from the legacy system. This needs confirmation with the business team — see [next-meeting-prep.md](../references/meetings/next-meeting-prep.md) and the Key Decision below.

## Follow-up materials owed by the business team

Per kickoff (section on Required follow-up materials):

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

These will land under `docs/` as they arrive and may seed updates or new KB topics.

## Key Decisions & Rationale

### Standalone first, not embedded in One Operations

**Why:** Trying to embed Optimus into a larger product surface on day one multiplies the integration surface area and makes the rewrite contingent on another product's roadmap. Standalone first lets Optimus stand up on its own timeline. Tech-stack choice should leave the door open, but no integration work is in scope.

### MVP narrows the lender matrix to one prime + one fallback

**Why:** Each lender currently costs 30–60 days to integrate. Even with a strong abstraction, MVP can't validate the routing model and ship value across the full multi-tier matrix in a single quarter. Two lenders (prime + fallback) is the minimum that exercises the routing logic. See [lender-routing.md](lender-routing.md).

### Project completion + funding is in MVP

**Why:** That's where contractor revenue lands. See [project-completion-and-funding.md](project-completion-and-funding.md).

### Mobile-friendly is non-negotiable, not a nice-to-have

**Why:** The consumer flow is used during in-home sales. The contractor often hands their phone to the homeowner or sends a link the homeowner opens on their phone. Desktop-only would break the primary use case.

### No data migration from legacy *(working assumption — pending business team confirmation)*

**Status:** working assumption, queued for the next meeting with the business team. See [next-meeting-prep.md](../references/meetings/next-meeting-prep.md) for what we need to confirm.

**Why we're assuming this:** The new platform is a clean-room rewrite (see [clean-room-rules.md](clean-room-rules.md)), and that discipline extends to data, not just code. Pulling existing loan / contractor / borrower records out of the legacy system would re-couple Optimus to legacy schemas, lender-specific quirks, and the legacy partner's tech — which is what we're trying to break free from. The cleaner cutover: legacy continues servicing its existing loans until they wind down naturally; the new platform handles 100% of new originations from cutover onward.

**How to apply (while the assumption stands):** Don't propose data-migration tools, schema-mapping utilities, or "import from legacy" features. If a proposed feature seems to need legacy data, ask whether the borrower or contractor can re-enter it (re-onboarding the contractor on the new platform; new applications start fresh) or whether the feature should wait until enough native data has accumulated. If business-team direction lands differently after the next meeting, this Key Decision and the related Timeline note will be revised.

## Cross-References

See also: [application-flow.md](application-flow.md), [lender-routing.md](lender-routing.md), [lender-integration-model.md](lender-integration-model.md), [contractor-onboarding.md](contractor-onboarding.md), [project-completion-and-funding.md](project-completion-and-funding.md), [compliance.md](compliance.md), [credit-pulls.md](credit-pulls.md), [tech-stack.md](tech-stack.md).
