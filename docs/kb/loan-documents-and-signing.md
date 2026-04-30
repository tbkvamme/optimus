← [KB index](index.md)

# Loan Documents and Signing

Why loan-document signing stays with the lender, not Optimus.

## Current State

Defined as out-of-platform in the kickoff (section on Loan documents and signing). Not yet implemented because nothing is implemented yet, but the design rule is set.

## How It Works

After the lender returns an approval (step 9 in [application-flow.md](application-flow.md)):

1. The lender sends loan documents directly to the borrower (via the lender's own delivery channel — email, lender portal, etc.).
2. Signing happens through the lender's own process (the lender's e-signature platform, IDV checks, etc.).
3. Optimus's role: trigger the lender's signing flow and observe completion via webhook/status update.

## Key Decisions & Rationale

### Signing is lender-owned

**Why:** The lender already owns the regulatory burden around loan documents (truth-in-lending disclosures, state-specific addenda, e-signature consent, etc.) and already operates the IDV pipeline tied to signing. Mirroring this inside Optimus would duplicate that compliance footprint and trigger additional verification requirements (Optimus would effectively become a co-presenter of regulated documents).

**How to apply:** When scoping document workflows, signing UI, or IDV features for Optimus, default to "no — lender does it." The only Optimus-side concern is the trigger and the status read-back.

## Known Limitations

- The exact trigger semantics per lender (do we POST a "send-docs" intent, or does the lender do it automatically on approval?) are not yet known per lender.
- Status visibility into the signing process (signed vs sent vs viewed vs declined) varies per lender's webhook taxonomy. See [lender-integration-model.md](lender-integration-model.md).

## Deferred / Future

- Showing signing status in the contractor dashboard with lender-specific event detail.
- Re-trigger / resend-docs flow on the contractor side.
- Out-of-band reminders to the borrower if signing stalls (only if the lender doesn't already handle this).

## Cross-References

See also: [application-flow.md](application-flow.md), [compliance.md](compliance.md), [lender-integration-model.md](lender-integration-model.md).
