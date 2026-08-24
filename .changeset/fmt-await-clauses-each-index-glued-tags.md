---
'@rsvelte/fmt': patch
---

Three formatter-parity fixes. An `{#await}` block now keeps exactly the clauses prettier-plugin-svelte keeps — the decision is taken once from whether the pending / then / catch fragments hold anything that is not blank text, so an empty `{:then}` is dropped (and the surviving clause collapses into the header) in every combination, not just the three that were special-cased. An `{#each}` header's ` as ` keyword and `, index` separator are re-printed canonically instead of preserving the source's whitespace. And a run of expression tags glued together now shares one width budget, so the first breakable tag in an overlong run breaks the way the oracle breaks it.
