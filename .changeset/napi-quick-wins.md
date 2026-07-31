---
"@rsvelte/compiler": patch
"@rsvelte/vite-plugin-svelte-native": patch
---

Add a `compileBoth` NAPI export that returns `{ client, server }` from a single parse + analyze pass, for callers that need both compile targets for the same source (e.g. a dual-output SSR build) — verified byte-identical to two separate `compile()` calls, ~15-19% less user CPU per pair on a 20KB real-world component.

Also: cache `current_dir()` for the default `rootDir` lookup (matches upstream's `validate-options.js`, which evaluates `process.cwd()` once per module load rather than per compile) and skip JSON materialization for CSS class-value expressions whose node type can never be statically resolved. Output is unchanged in both cases.
