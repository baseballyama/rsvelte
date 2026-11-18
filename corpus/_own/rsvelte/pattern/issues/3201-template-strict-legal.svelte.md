# `3201-template-strict-legal.svelte`

**Issue:** [#3201](https://github.com/baseballyama/rsvelte/issues/3201)

The control, and the one that prices the fast-path guard: `0o755` / `0x1f` / `1_000`, an escaped backslash, `eval` as a call, a single `__proto__`, and `static` / `let` / `private` as property names. The guard is deliberately over-eager — it costs a real parse — so this file is what proves over-eager is not over-rejecting
