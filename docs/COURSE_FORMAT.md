# Course Format — Schema Version 1

Courses are currently bundled as JSON and are not downloaded from a catalog. The format is designed to evolve without executing arbitrary course scripts.

## Top-level fields

- `schemaVersion`: currently `1`.
- `id`: lowercase identifier with hyphens.
- `title`: human-readable title.
- `language`: programming language taught by the course.
- `description`: short introduction.
- `lessons`: ordered list of lesson objects.

## Lesson fields

- `id`: unique lowercase identifier.
- `title`: lesson title.
- `goal`: one-sentence learning goal.
- `content`: explanatory text, rendered as text.
- `steps`: ordered instructions.
- `exercisePath`: relative path inside the current workspace.
- `starterCode`: text written only when the exercise file does not already exist.
- `checks`: list of declarative checks.

## Supported checks

```json
{ "type": "containsAll", "values": ["const language", "JavaScript"] }
{ "type": "doesNotContain", "value": "TODO" }
```

A check can include an optional `label` for learner-facing feedback. Unknown check types are rejected. There is deliberately no `run`, `shell`, `script`, `regex`, or arbitrary expression check.

## Validation limits

The current validator caps lessons, steps, check counts, text lengths, individual check values, and starter file length. Exercise paths accept only simple path segments and reject path traversal and absolute/platform-specific paths. The checker caps the opened source file at 512 KiB.

## Limitations

This format is a prototype, not yet a public compatibility guarantee. Static checks are literal substring checks, not AST checks or runtime tests. Course packages should eventually have an explicit manifest, publisher/version metadata, integrity hash or signature, license metadata, asset limits, and a backward-compatibility policy.
