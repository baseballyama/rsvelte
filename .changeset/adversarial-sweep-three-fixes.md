---
"@rsvelte/compiler": patch
---

Four more parity fixes from the adversarial sweep: a folded server `$state` string constant stores its cooked value instead of raw quote-stripped source (`'\\\''` no longer renders three backslashes), folded server numbers render in JS spelling (`1e-7`, not `0.0000001`), dev-mode `console.log` wrapping evaluates a `$derived.by` expression body the way upstream does, and a comment between an `{#each}` item pattern and its delimiter is now rejected with upstream's error codes instead of compiling.
