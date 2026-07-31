---
"@rsvelte/svelte-check": patch
---

fix(svelte-check): mirror `addTypeToFunction`'s single `hasTypeDefinition` gate for SvelteKit route/hooks/params-matcher handlers, so a manually-typed parameter also suppresses the return-type injection, and unwrap a single level of `(expr)` around a `const` initializer before matching it against an arrow/function expression, so `export const GET = (async (event) => {...});` is still augmented
