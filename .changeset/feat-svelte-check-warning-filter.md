---
"@rsvelte/svelte-check": minor
---

feat(svelte-check): honor function `compilerOptions.warningFilter` via a Node sidecar

`rsvelte-check` reads diagnostic-relevant `compilerOptions` from `svelte.config.*`
statically, but `warningFilter` is a JS predicate the native compiler can't
evaluate, so it was silently ignored — a warnings-only divergence from the
official `svelte-check` for projects that use it.

When `svelte.config.js` declares a function `compilerOptions.warningFilter`,
`rsvelte-check` now spawns the consumer's Node **once per run** against a small
bundled sidecar (`lib/warning-filter.mjs`) that imports the config and applies
the function to the run's collected compiler warnings in a single batch. Because
`warningFilter` is a pure per-warning predicate, this post-pass is exactly
equivalent to Svelte's emit-time filter (the same argument the NAPI shim uses).

The sidecar never rejects: a missing Node, an unimportable config, a timeout, or
a malformed response all degrade to "keep every warning" plus a one-time stderr
note — the filter never silently drops a warning, and the exit code is unaffected.
A project with no function `warningFilter` never spawns Node (zero overhead).
