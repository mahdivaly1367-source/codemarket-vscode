# Architecture Decision Log

## D-001 — Keep the core extension separate from commerce

**Decision:** Build the VS Code learning experience first. Defer accounts, payment, and marketplace logic.

**Reason:** A marketplace adds security, legal, moderation, and operational complexity before the learning experience is validated.

## D-002 — Start with data-driven lessons, not course scripts

**Decision:** Version 0.1 uses JSON, text content, starter files, and a fixed allowlist of declarative checks.

**Reason:** Downloaded course code must not execute in the learner's host environment. Data-driven lessons reduce risk and simplify review.

## D-003 — Static source checks only in version 0.1

**Decision:** The prototype looks for literal text and does not execute learner code.

**Trade-off:** It can be inaccurate and is not suitable for serious grading. AST checks are a planned improvement; runtime assessment needs a separate isolated runner.

## D-004 — Keep the course schema explicit and versioned

**Decision:** Every course has `schemaVersion: 1`; unknown check types are rejected.

**Reason:** Future course packages need deterministic validation and migration rules.

## D-005 — Preserve exercise files

**Decision:** The extension creates a starter only when the target file does not exist.

**Reason:** A learning extension must not overwrite learner work.

## D-006 — Treat the handoff document as part of the product

**Decision:** `docs/SESSION_HANDOFF.md` is a required continuation document. Update it at each meaningful milestone.

**Reason:** The user intends to continue work across separate ChatGPT conversations. This file should record verified repository state and next steps, not hidden reasoning.


## D-007 — Separate programming language from instructional locale

**Decision:** Course metadata uses `programmingLanguage` (for example, `javascript`) and `contentLocale` (for example, `fa-IR`) as separate fields.

**Reason:** A JavaScript course may be taught in Persian, English, or another natural language. Marketplace localization must not confuse the language being learned with the language of the lesson text.
