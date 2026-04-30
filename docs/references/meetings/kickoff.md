Optimus Platform Kickoff & Strategic Overview — Key Summary Without Names

1. Purpose of the meeting

The meeting was an initial kickoff between the platform/business team and the development team to discuss rebuilding the Optimus platform as a new standalone enterprise-grade solution.

The goal is to replicate the current Optimus functionality while improving the architecture, user experience, mobile readiness, scalability, and long-term ownership/control.

⸻

2. Strategic reason for rebuilding Optimus

The current Optimus platform was originally built with technology controlled by a lending partner. This creates a strategic issue because the platform owner does not fully control the IP, roadmap, integrations, or future development.

The new version should therefore be built independently, based on business rules and functional requirements — not by copying code or technical implementation from the existing system.

Key strategic drivers:

Full ownership and control of the new platform.
Avoid dependency on a lender-owned solution.
Build a scalable enterprise platform.
Enable future integrations with One Operations.
Create a stronger foundation for long-term growth.

⸻

3. Commercial opportunity

Optimus currently processes a large volume of financing activity, estimated at around $500 million annually in funded U.S. volume.

There is an expectation that, with the right platform improvements and expansion, this could grow toward $1 billion annually over the next couple of years.

The platform also has potential to become a gateway into a large contractor network, creating opportunities to introduce additional One Operations tools later.

⸻

4. Platform approach

The first version should be a standalone Optimus replacement, not a deeply embedded One Operations module from day one.

However, it should be built using the same technology principles and reusable components where relevant, so it can later integrate with One Operations.

The platform should be built like modular “Legos,” meaning:

Standalone first.
Modular architecture.
Future-ready for additional tools.
Easy to extend with new lenders, modules, and services.
Capable of serving thousands of contractors.

⸻

5. Core platform function

Optimus is a multi-lender financing platform for contractors and homeowners.

Its main purpose is to route a customer to the most appropriate lender based on:

Credit profile.
Project category.
State/location.
Lender eligibility rules.
Product type.
Available loan programs.

The goal is to remove decision-making from the contractor and make the process simple: the contractor enters or sends the customer into the system, and the platform determines the correct lender path.

⸻

6. Lender routing logic

The platform is not meant to be an open marketplace where contractors manually choose from many lenders.

Instead, it should use rules-based logic to route the customer automatically.

The expected lender structure is generally:

Prime lender.
Near-prime lender.
Subprime lender.

There may also be multiple prime lenders if different lenders support different product categories, such as HVAC, solar, battery storage, or other project types.

The MVP should likely begin with a simpler setup, such as one prime lender and defined fallback logic.

⸻

7. Important change to current logic

A key improvement discussed was that the new system may first attempt to prequalify the customer through the prime lender before routing them to a lower-tier lender.

This could improve approval outcomes and ensure customers get the best available financing option before being stepped down.

⸻

8. Business rules required

The development team does not need access to the existing codebase.

What is needed instead:

Business rules.
Decision trees.
User stories.
Workflow descriptions.
Expected outcomes.
Lender-specific rules.
Prequalification logic.
Status definitions.
Application flow requirements.

The business team agreed to prepare documentation describing the platform logic and decision-making process.

⸻

9. IP and ownership position

A clear point was made that the new platform should not copy the existing system’s code or backend implementation.

The new system should be built from:

Business knowledge.
Functional requirements.
User experience needs.
New architecture.
New technical implementation.

This is important to avoid IP risk and ensure clean ownership of the new platform.

⸻

10. User roles and workflow

The main user roles discussed were:

Homeowner / borrower.
Contractor / merchant / seller.
Lender.
Platform/admin team.

The typical flow is:

Contractor receives a unique application URL.
Contractor sends the link to the customer or uses it during the sales process.
Customer enters basic information.
System performs a soft credit pull.
System selects the appropriate lender.
Customer chooses from available loan plans.
Customer completes the full lender-specific application.
Lender performs hard credit pull.
Customer receives approval, pending status, or other lender-specific result.
Customer signs loan documents directly with the lender.
Contractor completes the project.
Contractor submits project completion information.
Customer authorizes payment/funding.
Contractor is paid.

⸻

11. Application process

The initial prequalification page is simple and requires basic customer information such as:

Name.
Address.
State.
Project category.
Consent for soft credit pull.

After prequalification, the system displays the selected lender and available loan plans.

The full application is lender-specific and may include:

Financing amount.
Project type.
Language preference.
Borrower details.
Social Security number.
Date of birth.
Billing address.
Income.
Employment information.
Optional co-applicant.
Required disclosures.

⸻

12. Lender-specific differences

Each lender has different requirements.

Differences may include:

Application fields.
Approval statuses.
Required disclosures.
Identity verification.
Proof of income.
Proof of home ownership.
Stipulations.
Loan document flow.
API structure.
Webhook status updates.

Because of this, each new lender currently requires technical implementation work.

Current estimated time to add a lender is approximately 30 to 60 days, depending on complexity.

⸻

13. Soft credit pull and hard credit pull

The current platform uses a soft credit pull during prequalification.

In the future, the intention is for the new Optimus platform to own or control the soft credit pull independently rather than relying on a lender.

The hard credit pull happens later, when the customer submits the full loan application to the lender.

⸻

14. Loan documents and signing

Loan document signing is not handled directly inside Optimus.

Instead:

The lender sends the loan documents directly to the borrower.
Signing happens through the lender’s own process.
This is important for compliance and identity verification.
Trying to keep everything inside Optimus could trigger additional verification requirements.

The MVP should therefore trigger the lender’s signing process rather than replace it.

⸻

15. Status tracking and dashboard

The contractor dashboard shows application status and loan progress.

It includes information such as:

Customer details.
Project address.
Application ID.
Lender.
Approval amount.
Current status.
Timeline of lender events.
Contact information.
Required next steps.

Statuses are returned through lender APIs/webhooks and differ by lender.

⸻

16. Project completion and rebate/payment process

Project completion is an important part of the workflow, especially because it connects to rebate processing and contractor payment.

The contractor submits:

Equipment details.
Purchase location.
Brand.
Model number.
Serial number.
Project description.
Completion date.
Optional invoice attachment.

Once submitted, the lender may send a text or email to the homeowner asking them to authorize funds/payment to the contractor.

This process is considered an important MVP requirement.

⸻

17. Contractor onboarding

Contractor onboarding happens separately from the customer application flow.

Contractors must submit company and ownership information before being activated.

This may include:

Company structure.
Ownership details.
Tax ID.
Bank account information.
Required lender onboarding information.
Compliance training, where required by lenders.

A contractor is not activated in Optimus until onboarding and lender approval are complete.

⸻

18. Compliance discussion

The platform itself is not positioned as a lender. It facilitates the connection between contractors, homeowners, and lenders.

Most regulatory burden is handled by the lenders, especially around:

Loan documentation.
Customer identity verification.
Credit approval.
Funding.
Loan servicing.
Required disclosures.

However, the development team raised that the new platform should still be designed with proper security, auditability, data retention, and future compliance requirements in mind.

⸻

19. UX and design priorities

The new platform should improve the user experience, especially for contractors and homeowners.

Key UX priorities:

Simplicity.
Mobile-friendly application flow.
Clear contractor dashboard.
Reduced decision-making for contractors.
Easy customer completion during in-home sales.
Better visibility into loan/application status.
Clean and modern look and feel.

⸻

20. Required follow-up materials

The business/platform team should provide:

Click-through demos or wireframes.
Application flow examples.
Business rules.
Decision trees.
Lender routing logic.
MVP feature list.
Lender-specific requirements.
Known pain points.
API information where available.
Status definitions.
Documentation for contractor onboarding.
Any requirements not currently in the existing Optimus platform.

⸻

21. MVP timeline

The target discussed was to have an MVP by the end of summer, potentially ready to begin lender API integration work.

A broader production goal was mentioned for 2027, with the expectation that the new platform would run in parallel with the existing Optimus before a full migration.

⸻

22. Main takeaways

The key conclusion is that the new Optimus should be built as a clean, standalone, enterprise-grade platform that replicates the current core functionality but improves ownership, scalability, UX, mobile readiness, and future integration potential.

The immediate next step is to gather business rules, user flows, lender logic, and demo materials so the development team can scope the MVP properly.
