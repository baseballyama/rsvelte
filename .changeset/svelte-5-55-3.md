---
"@rsvelte/compiler": patch
---

Bump target Svelte to **5.55.3**. The single compiler-side commit `3937ec03b` "fix: correctly calculate `@const` blockers" adds seven async-const fixtures that exercise the same group-sync-statements async batching as 5.54.1's `6b33dd2a1` — skipped pending the same follow-up port.
