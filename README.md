# CodeMarket for VS Code

**CodeMarket** is an open-source starting point for interactive programming lessons inside Visual Studio Code. The long-term product vision is a creator-friendly course format and a marketplace for free and paid courses.

این مخزن فعلاً یک نمونهٔ اولیهٔ قابل‌آزمایش دارد: افزونهٔ VS Code با پنل آموزش، سه درس JavaScript، ساخت فایل تمرین، بررسی اولیهٔ پاسخ و ذخیرهٔ پیشرفت.

## Current status

- [x] VS Code extension scaffold and Activity Bar view
- [x] Three bundled JavaScript lessons
- [x] Starter files created without overwriting existing files
- [x] Persistent lesson completion status
- [x] Declarative, non-executing source-text checks
- [x] Course schema and path validation
- [x] Webview Content Security Policy and DOM rendering through `textContent`
- [ ] AST-based checks and robust unit tests for actual program behavior
- [ ] Sandboxed code-execution service
- [ ] Course-authoring tooling
- [ ] Accounts, purchases, and marketplace backend

## Important limitation

The current checker **does not run student code**. It only checks for required or forbidden literal text in a source file. This is intentionally limited and is not a proof that a program behaves correctly. The current release does not download or execute third-party course scripts.

## Development

Requirements: Node.js 20+ and npm. A recent VS Code version is recommended.

```bash
npm install
npm run verify
```

To open the extension locally, open this repository in VS Code, run `npm install` and `npm run verify`, then press `F5` to launch an Extension Development Host. In the new window, open a project folder, select the CodeMarket icon in the Activity Bar, and open an exercise.

On Windows, `scripts/publish-to-github.ps1` can create the intended GitHub repository and push `main`. Review the script first; it creates a **public** repository and refuses to overwrite a different `origin` remote. Run it from the project root after signing in with `gh auth login`.

## Repository guide

- `docs/SESSION_HANDOFF.md` — read this first when continuing work in a new chat or session.
- `docs/PRODUCT_SPEC.md` — product scope and target users.
- `docs/ARCHITECTURE.md` — current and planned architecture.
- `docs/SECURITY_MODEL.md` — threat model and implementation boundaries.
- `docs/COURSE_FORMAT.md` — current course format and compatibility rules.
- `docs/ROADMAP.md` — implementation stages.
- `docs/ACCEPTANCE_CRITERIA.md` — testable completion criteria.
- `docs/DECISIONS.md` — decisions and their rationale.

## License

MIT. See `LICENSE`.
