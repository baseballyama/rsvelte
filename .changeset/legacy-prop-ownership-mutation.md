---
"@rsvelte/compiler": patch
---

Dev-mode client output now applies ownership validation to prop member mutations in **legacy** (`export let`) components, e.g. `item.name = 1` inside an instance-script function or a `$:` block. The collection that drives the wrapper was gated on `analysis.runes`, so no legacy component ever emitted `$$ownership_validator.mutation(...)` — nor the `$.create_ownership_validator($$props)` preamble that goes with it. The emitted alias argument now mirrors upstream too: `prop_alias` is only ever set from a `$props()` destructuring key, so legacy props report `null`, and the reported path always starts with the local binding name rather than the alias.
