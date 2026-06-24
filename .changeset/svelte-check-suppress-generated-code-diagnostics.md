---
"@rsvelte/svelte-check": patch
---

svelte-check: drop diagnostics that fall inside svelte2tsx `Ωignore` regions.

svelte2tsx wraps the synthesised helper code it emits purely for type-checking
— e.g. a `bind:value` reverse-assignment `() => x.y.z = …`, cast shims —
in `/*Ωignore_startΩ*/ … /*Ωignore_endΩ*/`. Errors landing inside such a region
are artefacts of the generated TSX, not user errors: a `bind:value` closure, for
instance, drops the discriminated-union narrowing of a `let`-declared `$props`
binding, yielding a spurious `Property '…' does not exist` / implicit-any.

This ports official svelte-check's `isInGeneratedCode` so those diagnostics are
suppressed. On a large SvelteKit app this cleared the remaining narrowing /
cast / control-flow cluster (10 → 2 reported errors).
