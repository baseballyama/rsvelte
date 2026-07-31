---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): fix four SvelteKit `load`-augmentation divergences from `upsertKitFile`. A return-typed `function load(...)` declaration no longer skips its parameter injection (`hasTypedParameter` only ever looks at the parameter). A `const load = (...) => ...` whose initializer is itself function-like now gets its parameter typed directly instead of always being wrapped in `satisfies` — `findExports` only reaches for `satisfies` when the initializer *isn't* function-like, and unconditionally wrapping one that is can reject an otherwise-valid return value the official checker accepts. The JSDoc `@type`/`@param`/`@satisfies` gate that already suppressed re-annotation on `.ts` files now also applies on `.js` files across every route/hooks/params-matcher export, not just the ones #1944 covered. A multi-declarator `export const a = ..., b = ...;` is left untouched entirely, mirroring `findExports`' single-declarator requirement.
