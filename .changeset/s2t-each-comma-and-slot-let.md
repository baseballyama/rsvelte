---
"@rsvelte/svelte2tsx": patch
---

Two svelte2tsx projections: an `{#each}` collection whose source text contains a comma is wrapped in parens, matching upstream's guard against `for (const x of true, [1, 2])`; and a `let:` directive on a `<slot>` outside a component's children is emitted as the ordinary attribute upstream makes it instead of being dropped.
