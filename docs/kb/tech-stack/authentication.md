← [Tech Stack](../tech-stack.md)

# Authentication

How users prove who they are. Two distinct user groups are handled with different mechanisms — Auth0 for platform users, in-app one-time signed URLs for borrowers.

## Current State

Pre-implementation. The two-group model and the borrower-flow design are locked; concrete wiring (Auth0 tenant setup, JWT middleware config, token signing) is in the implementation plan.

## Two user groups

| Group | Who | Auth mechanism |
|---|---|---|
| **Platform users** | Internal admin team + contractors / merchants | Auth0 Universal Login → JWT bearer in API requests |
| **Borrowers** | Homeowners completing an application | One-time HMAC-signed URL → short-lived application-scoped session cookie |

The split exists because borrowers have a fundamentally different relationship to the platform: they don't have an ongoing account, they show up once (or twice — Part 1 then Part 2 of the application), and the in-home-sales context means they shouldn't have to set a password to start an HVAC loan. See [partner-and-borrower-experience.md](../partner-and-borrower-experience.md) for the experience model.

## Platform users: Auth0

- Auth0 tenant + an "Optimus" SPA application (frontend) + an "Optimus API" application (backend audience).
- Frontend uses `@auth0/auth0-react`. Login flows through Auth0's hosted Universal Login.
- Backend's ASP.NET Core authentication is configured with `AddJwtBearer` pointing at the Auth0 issuer + audience. Tokens are validated on every request.
- Role claims live under a custom namespaced claim (`https://optimus/roles`) and contain `admin` or `contractor` (or both).
- Authorization is policy-based: `[Authorize(Policy = "AdminOnly")]`, `[Authorize(Policy = "Contractor")]`, etc.
- Multi-factor authentication is enforced for `admin` users via Auth0 rules; available but optional for `contractor` users initially.

Auth0's free tier (currently 25,000 monthly active users) covers admin team + contractors with very wide headroom. The borrower split keeps the largest user category (homeowners) out of the MAU count entirely.

## Borrowers: one-time signed URL → application-scoped session

The flow:

1. **Issue.** A backend handler (called when the contractor sends the link, or at the right step in the consumer flow) issues a token. The token is HMAC-signed (`HMAC-SHA256` over `{application_id, expires_at, nonce}` with a server-side signing key). The signed token is encoded into a URL the borrower can open from email, SMS, or in-person handoff.
2. **Validate on landing.** When the borrower opens the URL, the backend verifies the signature, checks the expiry, and confirms the nonce hasn't been used (`OneTimeTokens` table tracks consumption).
3. **Issue session.** On valid token, a short-lived session cookie is set. The cookie is HttpOnly, SameSite=Lax, Secure, and tied to a specific application via a server-side session record. The session is **scoped to one application** — it grants the borrower access only to their own application's pages, not to a global "borrower account."
4. **Re-issue if needed.** If the borrower needs to come back later (e.g., resume Part 2 days after Part 1), a new one-time URL is issued from the application context — never re-using a consumed nonce.

Token TTL: short (default 24 hours). Session cookie TTL: long enough to complete the application step but well short of "ambient login" (target ~2 hours of activity).

The implementation lives in `Optimus.Application/Borrower/` (issue + validate handlers) and `Optimus.Infrastructure/Persistence/` (the `OneTimeTokens` table and configuration). Roughly 150 lines of code.

## Why split the auth model

- **Reduces friction for borrowers.** No password to remember, no account to create. The link works.
- **Matches the in-home-sale handoff.** A contractor passing their phone to the homeowner doesn't trigger a sign-up flow.
- **Keeps Auth0 MAU low.** Borrowers are by far the largest user volume; treating each as a MAU would exhaust the free tier quickly. With the split, only admin team + contractors count toward MAU.
- **Limits blast radius.** A leaked borrower URL exposes one application; a leaked Auth0 password could expose a whole contractor's contractor-side dashboard.

## WorkOS as a documented fallback

If Auth0 cost ever becomes a problem (the next pricing tier above free is steep, and large multi-thousand-contractor scale could push us into it), **WorkOS** is the off-ramp:

- Free tier currently covers up to 1M MAU on its User Management product.
- Deliberately enterprise-flavored — SAML / SCIM / SSO are first-class for the admin team.
- .NET-friendly REST API.
- Migration is non-trivial (token shape, role claim mapping, session model differ) but well-trodden in the industry.

This is captured here so the option is remembered, not because we're designing for migration. We are not building "auth provider abstraction" for swap-readiness in MVP — that's exactly the kind of preemptive abstraction [tech-stack.md](../tech-stack.md) cautions against.

## Key Decisions & Rationale

### Auth0 for platform users, not a self-hosted IdP

**Why:** Running our own identity provider (Keycloak, Authentik, etc.) is a non-trivial operational commitment for what amounts to a few thousand users at MVP scale. Auth0's free tier covers it; the time saved goes into building Optimus.

**How to apply:** Don't propose a self-hosted auth solution. If Auth0 doesn't work, we move to WorkOS — also hosted.

### Borrowers in-app, not in Auth0

**Why:** Account-less access is a better UX for the in-home-sale context, and it keeps MAU costs down. The one-time-URL pattern is simple, secure, and well-suited to "shows up once or twice and is done."

**How to apply:** When designing a feature that involves borrower access, default to the one-time-URL pattern. Don't introduce borrower account creation without an explicit requirement that demands it.

### One-time URLs are application-scoped, not user-scoped

**Why:** The borrower's relationship to the platform is per-application. A "borrower account" implies cross-application identity continuity that isn't part of the product. Scoping to one application keeps the security model simple — leaked URL exposes one loan, nothing else.

**How to apply:** Session lookups always require the application ID; there is no "borrower's home page" that lists their loans across contractors.

## Known Limitations

- The Auth0 tenant configuration (rules, custom claims, MFA enforcement, social connections) is currently a manual setup; the steps will be documented in the implementation plan.
- Token rotation, signing-key rotation, and revocation strategies for the borrower one-time URLs are documented but the implementation plan needs to confirm rotation cadence.
- Co-applicant / co-borrower scenarios (per [application-flow.md](../application-flow.md)) are not yet modeled — likely a second one-time URL per application, but TBD.
- We do not currently capture how a borrower who lost their email link recovers access; resend-from-contractor is the assumed default.

## Deferred / Future

- SSO from a corporate identity provider for the admin team (Auth0 supports it; turn on when requested).
- Federated identity for contractors (e.g., logging in via their company's Google Workspace) — possible via Auth0 connections.
- Per-feature MFA enforcement (e.g., only require MFA when an admin approves a funding gate, not on every login).
- WorkOS migration plan — not designed for, just remembered.
- A "borrower dashboard" that aggregates a borrower's applications across contractors. Out of scope until business-team requirements demand it.

## Cross-References

See also: [tech-stack.md](../tech-stack.md), [partner-and-borrower-experience.md](../partner-and-borrower-experience.md), [application-flow.md](../application-flow.md), [compliance.md](../compliance.md), [contractor-onboarding.md](../contractor-onboarding.md).
