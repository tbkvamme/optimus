← [KB index](index.md)

# Clean-Room Rules

The IP-driven constraint on how the rewrite uses any legacy material it has access to.

## Current State

The development team has explicitly opted out of access to the existing legacy codebase. Whatever public legacy artifacts are available (saved web pages, training materials, marketing copy) may be referenced for vocabulary, concepts, and field inventory — never for technical replication.

## The rule

Build Optimus **from business knowledge and functional requirements**, not by copying code, backend implementation, or technical patterns from any legacy system. This applies to public legacy artifacts the team has, to anything the business team distills from legacy, and to any future legacy material that may surface.

## What is allowed

- Reading kickoff and other business-team materials for design intent.
- Using legacy material as a reference for **vocabulary**, **concepts**, **field inventory**, and **the breadth of integrations the eventual platform must accommodate**.
- Distilling the above into business rules, user stories, design specs, and KB topics — substance only, not lifted code or UI.

## What is not allowed

- Copying or paraphrasing legacy backend behavior into the new platform's design.
- Replicating legacy UI screen flows screen-by-screen. Source material that shows a legacy screen sequence is informative for **what data is captured**, not **how the screen looks** or **what the click-flow is**.
- Inferring private API contracts, internal status codes, or business-rule details from public artifacts and treating them as authoritative.
- Anchoring design decisions on the identity of legacy platforms, brands, or partner companies. What matters is what the Optimus backend needs to support, not which legacy entity historically supported it.

## Key Decisions & Rationale

### Strategic driver: independence and IP ownership

**Why:** The current legacy platform was built on technology controlled by a lending partner, leaving Optimus without full control of the IP, roadmap, integrations, or future development. Rebuilding from business rules — not from legacy code — is the way to assert clean ownership of the new platform. The kickoff was explicit on this.

### "We don't need access to the existing codebase"

**Why:** Per the kickoff, the development team explicitly does not need access to legacy source. What it needs instead is business rules, decision trees, user stories, workflow descriptions, expected outcomes, lender-specific rules, prequalification logic, status definitions, application flow requirements. The business team is preparing those; Optimus will be built from them.

### Don't dwell on legacy company / platform identity

**Why:** Identity findings ("this legacy artifact is from X's portal", "this legacy system is operated by Y") are interesting trivia but do not drive backend design. The KB and design docs should describe what the Optimus backend must support — process, fields, states, transitions, integration patterns — without anchoring on legacy actors. Identity findings can be noted in passing in source-material summaries; they don't belong in the KB.

## Known Limitations

- The boundary between "vocabulary inspired by legacy" and "design copied from legacy" is judgment-based. When in doubt: lean toward the business-rule version, not the screenshot version.
- Future business-team deliverables may themselves be informed by legacy. That's fine — Optimus's contract is with those deliverables, not with legacy artifacts directly.

## Cross-References

See also: [domain-glossary.md](domain-glossary.md), [contractor-onboarding.md](contractor-onboarding.md), [mvp-scope.md](mvp-scope.md).
