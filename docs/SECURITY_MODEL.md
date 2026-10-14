# Security Model

## Current promise

Version 0.1 does **not** execute learner code or course-defined scripts. It reads a bounded-size source file and performs literal substring checks. This reduces execution risk but is not a full assessment system.

## Assets to protect

- Learner files outside the intended exercise paths.
- Local tokens, SSH keys, passwords, environment variables, and browser data.
- Host CPU, memory, disk, and network capacity.
- Marketplace accounts, payment data, course ownership, and private course packages (future).
- Integrity of published course versions and assessment results.

## Threat actors and abuse cases

- A malicious instructor uploads a course designed to execute on learner machines.
- A malicious course uses path traversal, symlinks, oversized data, unsafe HTML, or malformed JSON.
- Learner code attempts filesystem, network, process, or resource abuse during assessment.
- A learner manipulates local progress or static checks to bypass course completion.
- An attacker abuses assessment endpoints for denial of service or cost exhaustion.
- A compromised instructor account publishes a malicious course update.

## Current controls

- Course schema and unknown-check rejection.
- Relative exercise paths are allowlisted to plain path segments; absolute paths, `..`, backslashes, drive prefixes, and control characters are rejected.
- Existing exercise files are opened rather than overwritten.
- Exercise input is bounded to 512 KiB before checking.
- Only two checker types exist: `containsAll` and `doesNotContain`.
- No regex, shell command, JavaScript expression, plugin hook, course script, or student program is executed by the checker.
- Webview CSP is restrictive (`default-src 'none'`) and webview code does not place course text into `innerHTML`.
- Webview resource access is disabled through an empty `localResourceRoots` array.

## Known limitations

- Static substring checks can be defeated by comments or dead code and can reject valid alternate solutions.
- Local completion state is not authoritative and can be modified by a determined user.
- Path-component checks reduce traversal and symlink risks but are not a substitute for a dedicated sandbox.
- This is a prototype; no security audit has been performed.

## Requirements before a hosted runner

1. Run jobs in a separate service/account/security domain from the marketplace API.
2. Use per-job ephemeral filesystems and destroy the environment after execution.
3. Deny network access by default; allow only explicitly approved destinations when justified.
4. Provide no host credentials, secrets, Docker socket, privileged mode, or broad host mounts.
5. Apply CPU, memory, process count, disk, file size, output size, and wall-clock time limits.
6. Run as an unprivileged identity and evaluate stronger isolation than a default container when the threat model requires it.
7. Pin and review language images and dependencies; do not run arbitrary install hooks from course packages.
8. Limit concurrency and requests per user; account for cost-amplification and denial-of-service attacks.
9. Keep secrets out of logs; bound stdout/stderr and sanitize error messages.
10. Test sandbox escape, path traversal, symlink, fork bomb, infinite loop, memory exhaustion, and network exfiltration cases before release.
11. Keep the runner patched and monitor it independently of the extension release cycle.
12. Use signed/versioned course packages, moderation, revocation, and incident-response procedures for marketplace content.

## Release rule

Do not claim the product safely executes untrusted programs until isolation has been independently reviewed and abuse tests pass. Containers and Workspace Trust are layers, not complete guarantees.
