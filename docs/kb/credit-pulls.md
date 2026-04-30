← [KB index](index.md)

# Credit Pulls

Soft pull at prequalification, hard pull at full application.

## Current State

Pre-implementation. The split between soft and hard pulls is defined; ownership of the soft pull is in transition.

## How It Works

### Soft pull (prequalification)

- Triggered after the homeowner enters basic info and consents (step 4 in [application-flow.md](application-flow.md)).
- No impact on the homeowner's credit score.
- **Today:** performed by the lender (specifically the prime lender that runs the prequal).
- **Target:** owned by Optimus, independent of any individual lender. The platform does the soft pull, then routes to a lender based on the result.

### Hard pull (full application)

- Triggered when the homeowner submits the lender-specific full application (step 8 in [application-flow.md](application-flow.md)).
- Performed by the lender.
- Stays with the lender — no current intent to bring this in-house.

### Pull triggers map to the application's two-part split

The application is internally split into two parts (see [application-flow.md](application-flow.md)). Each part has its own submit event and its own consent capture:

- **Soft pull** is triggered on submit of **part 1** (basic identity + address + project category + soft-pull-consent + electronic-disclosures-consent). It runs *before* routing — its result is a routing input.
- **Hard pull** is triggered on submit of **part 2** (affordability + employment + hard-pull-consent), which is the lender-specific full application.

Each pull has distinct consent text presented to the borrower:

- Soft-pull consent: "won't impact your credit score" disclosure.
- Hard-pull consent: "may impact your credit score; I authorize the lender to verify the information in my credit report and periodically update my credit information."

The backend must record consent for each pull as a separate event, with timestamp, IP, and the e-signature / checkbox-acceptance binding. See [compliance.md](compliance.md) for the broader authorization-capture pattern.

### Some product types bypass the soft pull

Not every lender product uses soft-pull-at-prequal. Notably, revolving-credit-card products may go directly to a hard pull at application time without a soft-pull prequal step. The routing layer must accommodate this — see [lender-routing.md](lender-routing.md).

## Key Decisions & Rationale

### Optimus owning the soft pull is a long-term target, not an MVP goal

**Why:** Owning the soft pull means an independent credit-bureau relationship and the contracts/compliance work that comes with it. MVP can defer that and rent the soft pull from the prime lender, as long as the routing layer is built so the source of the soft pull is swappable later.

**How to apply:** When designing the routing input for borrower credit profile, treat the source of the credit data as a pluggable concern. Don't bake "the soft pull comes from the prime lender" into the data model.

### Hard pull stays with the lender

**Why:** The hard pull is part of the lender's underwriting decision and lives in their compliance and credit-bureau relationships. Pulling it into Optimus has no upside for the platform and adds significant compliance burden.

## Known Limitations

- The legal/contractual prerequisites for Optimus to own the soft pull (credit bureau agreements, FCRA permissible purpose, etc.) are not scoped here.
- The current legacy soft-pull provider relationship is not documented in the available references.

## Deferred / Future

- Optimus-owned soft pull integration with credit bureaus.
- Re-pull logic for borrowers who shop later (timing, consent, caching).
- Pre-screen / prescreen-with-firm-offer-of-credit options.

## Cross-References

See also: [application-flow.md](application-flow.md), [lender-routing.md](lender-routing.md), [compliance.md](compliance.md), [lender-integration-model.md](lender-integration-model.md).
