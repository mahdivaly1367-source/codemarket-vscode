# Product Specification

## Vision

CodeMarket is a VS Code-first learning product. Learners complete programming exercises in their own editor. Independent instructors can eventually author, validate, publish, price, and update courses without changing the extension itself.

## Users

- Learners who want hands-on practice instead of video-only learning.
- Instructors who want to package lessons, starter files, hints, and assessments.
- Organizations that may later want private courses, team progress, and reporting.

## Product principles

1. **Editor-first:** lessons should be next to the code, not a separate video portal.
2. **Data-driven courses:** course content is data, not arbitrary executable extension code.
3. **Safe by default:** no untrusted code executes on the learner's host.
4. **Portable format:** lessons should be exportable and versioned.
5. **Free core, optional commerce:** the extension may remain open source while course authors sell separately licensed content.
6. **Honest assessment:** every checker must disclose what it actually verifies.
7. **Incremental delivery:** build and test a vertical slice before adding accounts, payments, or a marketplace.

## MVP scope (0.1)

- A VS Code Activity Bar view.
- One bundled JavaScript course with three short exercises.
- Lesson selection and instructions.
- Safe creation/opening of starter files inside the current workspace.
- Declarative static checks that do not execute the code.
- Local completion progress.
- Documentation and automated unit tests.

## Explicitly out of scope for 0.1

- Running submitted code.
- Installing course-defined dependencies.
- Downloading third-party course packages.
- Instructor publishing UI.
- User accounts and cloud synchronization.
- Checkout, payouts, coupons, subscriptions, or refunds.
- AI-generated grading or sending learner source code to an external AI service.

## Future marketplace principles

Course authors own or license their content. Course packages need schema/version checks, malware and secret scanning where applicable, review and reporting workflows, clear licensing, price/entitlement rules, version pinning, and a takedown process. Purchasing a course should grant a clearly defined license and not transfer ownership of its content.
