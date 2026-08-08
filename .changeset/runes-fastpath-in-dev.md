---
'@rsvelte/compiler': patch
---

Let the runes fast path run in dev mode. Eligibility was gated on `!dev` and on `prop_mutation_vars` being empty, so a runes component compiled with `dev: true` — or any component with a mutated prop — took the per-statement text pipeline instead. Neither condition belonged there: `prop_mutation_vars` feeds a pass that runs over the whole result after the loop, and the only dev-only per-statement stage is the `console.` wrap, which is now checked per statement rather than by disabling the path wholesale.
