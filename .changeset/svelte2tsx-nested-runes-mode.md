---
"@rsvelte/compiler": patch
---

svelte2tsx now enters runes mode when the only rune sits below a statement — a bare block, an `if` branch, a loop, a `switch` case, a `try`, a label or a `class static {}`. Such a component was emitted with the legacy Svelte 4 component typing (`__sveltets_2_isomorphic_component` and `InstanceType`, with no `bindings`) instead of the Svelte 5 function-component typing, so every editor diagnostic and `rsvelte-check` result for it went through the wrong path. `do…while` and a class `static {}` were also missing from the recursive rune walker itself.
