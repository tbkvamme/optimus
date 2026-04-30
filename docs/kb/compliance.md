← [KB index](index.md)

# Compliance

Where regulatory burden lives, and what Optimus must still design for despite being a facilitator.

## Current State

Defined at the level of posture and design discipline; no specific compliance frameworks are scoped yet.

## Posture: facilitator, not lender

Optimus is **not a lender**. It facilitates the connection between contractors, homeowners, and lenders. This shapes who carries what regulatory burden.

### What lenders own

- Loan documentation (TILA disclosures, state-specific addenda)
- Customer identity verification (IDV)
- Credit approval
- Funding
- Loan servicing
- Required disclosures

### What Optimus must design for despite the facilitator stance

- **Security** — protecting borrower PII, contractor financial info, lender API credentials, etc.
- **Auditability** — who did what when, especially around routing decisions, application data changes, and status updates.
- **Data retention** — how long Optimus holds borrower applications, pulled credit data (if Optimus eventually owns the soft pull), uploaded documents, and event logs.
- **Future compliance requirements** — the platform should be in a position to onboard new compliance regimes (e.g., CFPB rule changes, state-level lending laws) without architectural rewrites.
- **Tenant data isolation** — one contractor must not see another contractor's borrower data. This is both a security concern (access control enforced through tenant-scoped queries) and an audit concern (audit-log rows are tenant-tagged, enabling tenant-scoped exports for regulator requests or contractor disputes). See [ownership-and-tenancy.md](ownership-and-tenancy.md).

## Key Decisions & Rationale

### Keep loan-document signing and IDV at the lender

**Why:** Pulling these into Optimus would shift the regulatory burden onto the platform. As a facilitator, Optimus avoids becoming a regulated party in the loan transaction. See [loan-documents-and-signing.md](loan-documents-and-signing.md).

### Soft-pull ownership transition has compliance implications

**Why:** When Optimus eventually owns the soft pull (target state), it takes on FCRA permissible-purpose obligations, credit-bureau contractual obligations, and consumer-disclosure obligations around the pull. This is one reason the soft-pull-ownership shift is deferred past MVP. See [credit-pulls.md](credit-pulls.md).

### Audit logs are not optional

**Why:** Routing decisions affect who lends and on what terms; they may need to be reconstructable years later for regulator inquiries, lender audits, or contractor disputes. Status changes need to be traceable end-to-end (Optimus → lender → back). Building the audit trail in from the start is much cheaper than retrofitting.

### Authorization-language capture for credit/reference verification

**Why:** The contractor-onboarding flow requires the contractor to authorize the platform (or an authorized verifier acting on its behalf) to pull business credit and reference reports. This is an FCRA-style permissible-purpose touchpoint in the U.S. and has Canadian-equivalent privacy/consent obligations. The platform must:

- Render authorization language in Optimus's own framing (no inherited or third-party-verifier framing).
- Capture acceptance as a discrete record with timestamp, IP, and e-signature linkage.
- Retain the captured record for audit and dispute purposes.
- Support re-acceptance flows when the language materially changes.

The same pattern applies to consumer-side soft-pull and hard-pull consents — distinct authorization records, captured per consent event. See [credit-pulls.md](credit-pulls.md).

## Known Limitations

- No specific compliance frameworks (PCI, SOC 2, state lending laws) are yet scoped or claimed.
- Lender-specific audit/disclosure requirements vary and will be enumerated as lender integrations begin.
- Data-retention timelines per data class are TBD.

## Deferred / Future

- SOC 2 / equivalent certification.
- Concrete data-retention policies per data class.
- Compliance-training delivery for contractors (where lenders require it). See [contractor-onboarding.md](contractor-onboarding.md).
- DPIAs / privacy reviews per integration.
- Dispute / records-request workflow for borrowers.

## Cross-References

See also: [loan-documents-and-signing.md](loan-documents-and-signing.md), [credit-pulls.md](credit-pulls.md), [contractor-onboarding.md](contractor-onboarding.md), [lender-integration-model.md](lender-integration-model.md), [mvp-scope.md](mvp-scope.md), [tech-stack/observability.md](tech-stack/observability.md) (audit-log boundary, where compliance events live vs. application logs), [ownership-and-tenancy.md](ownership-and-tenancy.md) (tenant data isolation).
