# Roadmap

## Phase 0 — Working vertical slice (in progress)

- [x] Extension Activity Bar and Webview panel
- [x] Bundled JavaScript starter course
- [x] Open/create exercises without overwriting existing files
- [x] Progress persistence
- [x] Declarative non-executing checks
- [x] Course and path validation
- [x] First automated tests
- [ ] Run dependency install, typecheck, tests, and bundle in the project environment
- [ ] Manual Extension Development Host smoke test
- [ ] Fix defects revealed by real smoke tests

## Phase 1 — Assessment quality

- [ ] Refine the course schema and validation errors
- [ ] Add a JavaScript parser/AST-based assessment for the sample course
- [ ] Add accessibility and keyboard-navigation checks
- [ ] Add integration tests for progress persistence and non-overwrite behavior
- [ ] Produce a VSIX and test a clean install
- [ ] Establish release/versioning conventions

## Phase 2 — Authoring and import

- [ ] Document a course-authoring workflow
- [ ] Build a course pack validator/preview command
- [ ] Add a safe course import flow that treats packages as untrusted data
- [ ] Add course licensing, attribution, version, and integrity metadata
- [ ] Do not add arbitrary scripts or dependency installers as an authoring shortcut

## Phase 3 — Isolated execution design

- [ ] Write runner threat model and isolation decision record
- [ ] Compare sandbox technologies for the intended hosting environment
- [ ] Define per-job CPU, memory, process, disk, output, network, and time limits
- [ ] Prototype with deliberately hostile test programs in a non-production environment
- [ ] Independent security review before production use

## Phase 4 — Marketplace foundation

- [ ] Define user roles and account lifecycle
- [ ] Course publishing, versioning, preview, reporting, moderation, and takedown
- [ ] Purchases, entitlements, refunds, payouts, and tax/compliance design
- [ ] Secure API and database model
- [ ] Rate limits, audit logging, backups, and incident response
- [ ] Privacy policy and data-retention rules

## Phase 5 — Public launch

- [ ] Compatibility matrix and extension marketplace packaging
- [ ] Signed release process and dependency review
- [ ] Accessibility, localization, telemetry opt-in, and privacy review
- [ ] Load tests and runner abuse tests
- [ ] Support process and creator documentation
