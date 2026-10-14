# Architecture

## Current prototype

```text
VS Code Extension
  ├─ Activity Bar + Webview UI
  ├─ Bundled course JSON
  ├─ Course schema validation
  ├─ Workspace file/path guard
  ├─ Literal-text checker (no code execution)
  └─ VS Code globalState (completion progress)
```

### Runtime flow

1. The extension loads the bundled course JSON and validates its shape.
2. The Webview receives only the current course state through the extension messaging API.
3. Dynamic course text is rendered with DOM `textContent`, not HTML injection.
4. When requested, the extension creates a starter file only if the target file does not already exist.
5. The checker reads a bounded-size exercise file and tests only the supported declarative checks.
6. Completed lesson IDs are persisted in extension `globalState`.

## Planned architecture

```text
VS Code Extension ── HTTPS ── API / Course Catalog
       │                           ├─ Identity and entitlements
       │                           ├─ Course metadata + signed versions
       │                           ├─ Instructor publishing workflow
       │                           └─ Payment provider integration
       │
       └── Assessment request ── Queue ── Isolated Runner Pool
                                        ├─ ephemeral workspace
                                        ├─ no ambient credentials
                                        ├─ network denied by default
                                        ├─ CPU/memory/time/process limits
                                        └─ output and lifecycle limits
```

These are future components, not implemented services.

## Trust boundaries

- **Extension code:** distributed and reviewed as software; should remain small and avoid unnecessary privileges.
- **Course content:** untrusted data once courses can be installed from a marketplace. Parse it under size/schema limits; never treat it as JavaScript/HTML to execute.
- **Learner code:** untrusted. The current prototype reads it as text only.
- **Assessment runner:** a separate security boundary. It must not share filesystem mounts, credentials, or broad network access with the marketplace API.
- **Marketplace backend:** manages identity, course versions, purchases, and audit trails. It must not run learner code in the web/API process.

## Key implementation choices

- TypeScript for the extension.
- esbuild for VS Code extension bundling.
- A JSON course format with a `schemaVersion` field.
- Strict allowlist of checker types. Unknown check types fail validation.
- VS Code `globalState` for progress in the prototype.
- No payment or authentication dependency in the prototype.

## Future scaling considerations

Separate catalog reads from assessment execution. Use queueing and per-user quotas for potentially expensive work. Store immutable course versions and bind purchases to version/license policies. Keep assessment output bounded and redact it before logging. Avoid treating containers alone as a sufficient security boundary for hostile code; evaluate sandboxing options and threat assumptions before production.
