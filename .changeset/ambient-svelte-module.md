---
'@rsvelte/cli': patch
---

`typecheck` no longer reports TS7016 for an import of an untyped component when an ambient module's pattern, such as `declare module '*.svelte'`, matches its specifier. TypeScript reads that module instead, as svelte-check does.
