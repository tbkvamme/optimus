← [KB index](index.md)

# Contractor Onboarding

How a contractor goes from "interested" to "active and able to originate loans on Optimus."

## Current State

Pre-implementation. Defined as **separate from** the consumer application flow — onboarding happens before a contractor can hand out application URLs to homeowners.

## How It Works

### Onboarding data model

The backend must support a contractor record built from the field groups below. Items are presented in a typical user-completion order, but the underlying record is one logical entity.

**Primary contact** — the person filling out the onboarding application:

- First name, last name, title, email, work phone
- Mobile phone + SMS opt-in (separate consent flag)
- Are-you-an-owner flag (gates whether the first owner block pre-fills from this person)

**Business identification:**

- Business legal name (merchant)
- Doing-business-as (DBA)
- Business structure (LLC, S-Corp, C-Corp, Sole Proprietor, etc. for U.S.; equivalents for Canadian incorporation)
- Federal tax ID (U.S. EIN) / Canadian business number
- Contractor license #
- In-business-since date
- Number of employees
- Primary business category
- Type of service / product offers
- Primary use of Optimus (intent at onboarding)
- Website URL (with conditional path for "no website")
- Referral source (how-did-you-hear)

**Sales metrics** — used for lender-side merchant underwriting, not just bookkeeping:

- Annual consumer sales revenue
- Annual consumer finance volume
- Average ticket size

**Business address:**

- Street, city, state/province, postal code, country
- Optional separate mailing address (toggle-driven; when off, mailing address fields are hidden)

**Beneficial owners (1..N):**

- A list of beneficial owners. Legacy supported up to 4; the rewrite should treat this cap as configurable to handle complex ownership structures.
- Per owner: first/last name, email, phone, title, date of birth, owner-since date, SSN (U.S.) or SIN (Canada), % ownership, address (street, city, state/province, postal code, country)
- Validation: ownership percentages across all listed owners must sum to 100%
- Owners disclosed progressively — each "add another owner" toggle exposes the next block

**Brand and distributor:**

- Primary brand installed
- Secondary brand installed
- Primary distributor / supplier

Useful both for lender underwriting (which equipment ecosystems the merchant operates in) and for downstream rebate eligibility.

**Banking** — needed for lender funding to the contractor:

- Account holder name
- Account type
- Routing number (U.S.) / transit + institution numbers (Canada)
- Account number
- Voided cheque image
- W-9 (U.S.) / equivalent tax form (Canada) document upload

**Authorization and signature:**

- Authorization for the platform (or an authorized verifier acting on its behalf) to verify contractor credit and references via consumer credit reporting agencies. Authorization copy must be drafted in Optimus's own framing — no inherited or third-party-verifier framing carries forward. See [compliance.md](compliance.md).
- Acceptance of the Optimus user agreement (rewrite-era copy).
- E-signature.

**Per-lender terms of service:**

- The contractor must accept terms of service for each lender they will originate loans through. Whether this is collected upfront at enrollment or just-in-time as new lenders are introduced is an open design decision — see "Per-lender ToS timing" under Key Decisions.

**Hidden / system-populated:**

- Referral / campaign metadata (source channel, original-email, application-type)
- Internal record-type / unique ID

### Conditional-logic patterns visible in the data model

- **Website Y/N** — toggling "no website" replaces the URL field with a no-website acknowledgment.
- **Different mailing address** — toggle exposes a parallel mailing-address block; otherwise mailing = business address.
- **Progressive owner disclosure** — owner blocks are added one at a time via "add another owner" toggles, capped at the configured maximum.
- **First-owner pre-fill** — when the primary contact identifies as an owner, owner 1 fields are seeded from the primary contact data (still editable).

### Activation gate

A contractor is **not activated in Optimus** until onboarding **and lender approval** are both complete. The contractor cannot originate consumer loans before this gate clears.

Activation is also **tenant creation**: passing the gate is when the contractor's tenant becomes operational in the platform — sales-rep accounts can be invited, application URLs can be issued, audit-log rows start accruing under the new `tenant_id`. Pre-activation, the contractor record exists but the tenant boundary is not yet "live." See [ownership-and-tenancy.md](ownership-and-tenancy.md).

## Key Decisions & Rationale

### Onboarding is separate from the consumer flow

**Why:** They have different actors (the contractor's owner/admin vs. the homeowner), different data (business identity vs. consumer credit), and different lifecycle (a contractor onboards once and stays; consumers come and go). Conflating them would push consumer-flow complexity into onboarding and vice versa.

### Lender approval is a hard gate

**Why:** Lenders have their own KYB / merchant-approval requirements for the partners that originate loans on their behalf. Optimus can collect onboarding data and forward it, but the activation decision belongs to the lender. Bypassing this gate would expose the platform and the lenders to compliance risk.

### Compliance training is per-lender

**Why:** Some lenders require their merchants to complete training (regulatory disclosures, sales practices). Where required, this is enforced as part of onboarding. Optimus must support gating activation on training completion.

### Per-lender ToS timing — open design question

The contractor must accept each supported lender's terms of service before originating loans through that lender. Three reasonable patterns:

1. **Upfront opt-in to all lenders at enrollment** — simplest contractor experience, but creates onboarding friction and forces ToS re-acceptance whenever a new lender is added.
2. **Just-in-time on first routing to a lender** — less friction at onboarding, but shifts ToS acceptance into the consumer flow, which the kickoff explicitly wants frictionless.
3. **Hybrid** — upfront for the MVP lender(s); just-in-time (or a refresh prompt at next contractor login) for any added later.

**Why open:** The kickoff doesn't specify, and both ergonomic and per-lender contractual requirements may force the choice. Capturing here so it isn't decided implicitly.

**How to apply:** Don't bake "ToS happens at enrollment" or "ToS happens at routing" into the data model. The backend must support either pattern (per-contractor, per-lender ToS-acceptance records with timestamps).

### Beneficial-owner data model — list with ownership-sums-to-100% validation

The contractor record carries an ordered list of beneficial owners with KYC fields per owner. The platform must validate that ownership percentages across all listed owners sum to 100%.

**Why:** Lender KYB / merchant-approval processes universally require beneficial-owner disclosure with ownership percentages — an industry pattern, not a single-lender requirement.

### Sales metrics are merchant-underwriting input, not bookkeeping

Annual sales revenue, annual finance volume, and average ticket size are part of the onboarding record because lenders use them to underwrite the **merchant**. The platform must capture these even if the MVP contractor-facing UI doesn't display them anywhere — they are part of the lender hand-off payload.

### Authorization for credit / reference verification is a required capability

The contractor must explicitly authorize the platform (or an authorized verifier) to obtain business credit and reference reports during onboarding. The authorization must be rendered in Optimus's own framing, captured as a record (with timestamp, IP, e-signature), and retained for audit.

## Known Limitations

- Conformance of the data model above to **specific lender** onboarding requirements is TBD — each lender has its own merchant-onboarding intake (KYB) and the platform either forwards this data as-is or normalizes through an intermediate schema. The mapping decisions come per lender as integrations begin.
- The exact onboarding-form ergonomics (single-page vs. paginated, save-and-resume, mobile-friendliness) are not yet designed.
- Per-jurisdiction validations (state/province licensing rules, varying KYC document types and tax-form equivalents) are not yet enumerated.
- The configurable upper bound on the beneficial-owner list is TBD.

## Deferred / Future

- Self-service onboarding portal vs. admin-assisted.
- Training delivery / tracking (host inside Optimus vs. link out to the lender).
- Re-verification on a cadence (e.g., annual KYB refresh).
- Contractor team / sub-account management (multiple users per contractor).

## Cross-References

See also: [domain-glossary.md](domain-glossary.md), [application-flow.md](application-flow.md), [compliance.md](compliance.md), [partner-and-borrower-experience.md](partner-and-borrower-experience.md), [mvp-scope.md](mvp-scope.md).
