# Session Handoff — Read This First

This file exists specifically so work can continue in a **new ChatGPT conversation** without relying on the previous chat transcript. Read this file before changing code, then review the relevant source files and the latest Git state.

## Project identity

- Working name: **CodeMarket** (provisional; do not assume a trademark or marketplace domain is secured).
- Intended GitHub repository: `mahdivaly1367-source/codemarket-vscode`.
- Expected default branch: `main`.
- Current version: `0.1.0`, local prototype.
- Product goal: a free/open-source VS Code extension for interactive coding lessons, with a creator-friendly course format and a future marketplace for free and paid courses.
- User preference: keep explanations short and actionable; avoid making the user manually edit many files. Explain limitations honestly. Persian is preferred for project coordination; keep code identifiers in English.

## Current repository/remote state

The repository is now published publicly at `https://github.com/mahdivaly1367-source/codemarket-vscode`, on default branch `main`. On 2026-10-14, the user successfully ran `scripts/publish-to-github.ps1` on Windows; it created the public repository, pushed 81 Git objects, and configured local `main` to track `origin/main`. GitHub API verification confirms the current `main` commit is `10257bf50d3ffbbe93655a2a5b8123f0425dc127` (`chore: prepare CodeMarket GitHub publication`). Before further local work, verify `git status`, `git rev-parse HEAD`, and `git remote -v`; pull with `git pull --ff-only` if the local checkout is behind. Never put this project into one of the user's unrelated repositories.

## Origin of the product idea

The product idea arose from studying CodeRoad as an example of interactive learning inside VS Code. CodeMarket should be an independent implementation: do not copy CodeRoad source code, course content, branding, screenshots, or other protected assets. Keep the extension open source while designing a separate, clearly licensed path for third-party course sales.

The user explicitly chose for ChatGPT to build the project directly, in small verifiable phases, rather than delegate the entire task to another AI in one long prompt. The aim is to continue work in later conversations by reading this document and the current GitHub state.

## What is implemented now

- VS Code extension manifest and Activity Bar / Webview learning panel.
- Bundled course `courses/javascript-foundations/course.json` with three JavaScript exercises and Persian (`fa-IR`) instructional content.
- Course metadata distinguishes `programmingLanguage` from `contentLocale`, to support future Persian, English, and other localized course variants.
- Creates exercise files under the currently open workspace, without replacing an existing file.
- Stores completed lesson IDs using VS Code `globalState`.
- Checks source text with a small declarative check language (`containsAll` and `doesNotContain`).
- No `eval`, shell execution, child process, downloaded script, or third-party course execution.
- Course/path shape validation, limits on check counts/values/file size, and a webview Content Security Policy.
- Webview uses DOM APIs and `textContent` for course-controlled content, not `innerHTML`.
- Initial unit tests for course validation, path traversal rejection, and static checks.

## Critical implementation limitation

The current checks are only literal-text checks. They can give false positives and false negatives; they do not establish that code runs or behaves correctly. Do not describe the prototype as a secure code-execution platform. Do not add arbitrary course scripts or execute student code on the host. A true runner must be designed and tested as a separate, strongly isolated service before untrusted code is run.

## Verification actually performed in the first build session

- Initial implementation checkpoint: `c51e558629be04595f16e251596b036d601357d9`. Latest source-and-test checkpoint before this handoff-document refresh: `31f62d6f81a62660a5ed6adcebab7e012f5bd538`. Repository checkpoint immediately before this handoff-note update: `5aefbc19c91815653988656657c1e62d617023d5` (PowerShell publishing helper was refined but not executed on Windows). The latest source-and-test checkpoint remains `31f62d6f81a62660a5ed6adcebab7e012f5bd538`. Always query `git rev-parse HEAD` and `git status` for the actual current state; these SHAs are historical references, not a promise that they remain HEAD after later edits.

- Eight course-validator unit tests passed using the globally available Node test runner and `ts-node` (not the project's `npm test` command).
- TypeScript checks passed for the project source and test files using global `tsc`, Node typings available in the environment, and a temporary minimal VS Code declaration shim. This helps catch local errors but is not a replacement for compiling with the official `@types/vscode` package.
- The embedded Webview JavaScript passed a syntax parse check.
- `npm install` did not complete because the environment could not resolve `registry.npmjs.org` (`EAI_AGAIN`). Therefore `npm run verify`, the actual esbuild bundle, VS Code Extension Development Host testing, and VSIX packaging remain unverified.
- The user successfully ran the PowerShell publishing helper on Windows. Reported output confirms a public repo was created at `https://github.com/mahdivaly1367-source/codemarket-vscode`, `main` was pushed, and local `main` tracks `origin/main`. GitHub API independently confirmed commit `10257bf50d3ffbbe93655a2a5b8123f0425dc127`. The actual current local working-tree cleanliness must still be checked on the user's machine.
- No GUI smoke test or independent security audit has been performed.

## Required next actions

1. Inspect Git status, recent commits, and all files before editing. Preserve existing user work; do not force-push.
2. In an environment with npm registry access, run `npm install` and `npm run verify`. Fix every reproducible failure before reporting completion.
3. Run the extension in a VS Code Extension Development Host. Distinguish build/test success from an actual GUI smoke test.
4. Test the three lessons end-to-end: create/open starter, edit required text, pass checks, restart extension, verify progress persists, and verify an existing exercise file is not overwritten.
5. Improve feedback and correctness without introducing arbitrary code execution. Add a parser/AST-based checker before adding a runner.
6. Update `docs/SESSION_HANDOFF.md`, `docs/ROADMAP.md`, and `docs/DECISIONS.md` at the end of each meaningful stage, including commit SHA, tests run, actual outcome, known issues, and the next concrete task.
7. Before building a marketplace, decide course signing/review, payments, licensing, moderation, account security, privacy, and sandboxing separately.

## Intended near-term sequence

- Phase 0: verify build, unit tests, UI smoke test; fix prototype issues.
- Phase 1: stable schema, course validator, robust filesystem path handling, richer static/AST checks.
- Phase 2: authoring workflow and course package validation (still no arbitrary course scripts).
- Phase 3: isolated execution architecture and security review; implement only after explicit threat-model and resource-limit tests.
- Phase 4: marketplace backend, instructor accounts, entitlement checks, payments, and moderation.

## How to continue in a new chat

Ask the assistant to open `https://github.com/mahdivaly1367-source/codemarket-vscode`, read this file first, verify the latest `main` commit and inspect relevant source files before editing. Ask it to continue from the **next uncompleted item**, preserve existing work, and update this handoff file with actual commits and test results at the end of each stage. If local work is involved, first verify `git status`, `git rev-parse HEAD`, and `git remote -v`; pull remote updates safely before editing.
