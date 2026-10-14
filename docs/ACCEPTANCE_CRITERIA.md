# Acceptance Criteria

## Prototype build and tests

- `npm run check-types` exits successfully.
- `npm test` exits successfully.
- `npm run compile` creates `dist/extension.js`.
- An invalid schema version, duplicate lesson ID, duplicate exercise path, path traversal path, or unknown check type is rejected.
- No test depends on executing course or learner code.

## VS Code smoke test

- [ ] Extension activates when its view or command is opened.
- [ ] CodeMarket icon and Learn view are visible.
- [ ] All three lessons appear and selection updates the lesson detail.
- [ ] Without an open workspace, opening an exercise shows a clear warning and does not crash.
- [ ] The exercise file is created under the open workspace.
- [ ] If the file already exists, its content is preserved.
- [ ] A missing exercise produces understandable feedback when checked.
- [ ] A correct literal-text solution passes, and a starter containing TODO fails.
- [ ] Completion survives extension reload.
- [ ] Course strings are displayed as text; they cannot inject markup into the Webview.
- [ ] Keyboard focus and focus indicators work in the Webview.

## Release truthfulness

A successful TypeScript build is not the same as a GUI smoke test. Reports must list exactly which commands and manual checks actually ran. Do not call the prototype production-ready, and do not claim it executes code safely.
