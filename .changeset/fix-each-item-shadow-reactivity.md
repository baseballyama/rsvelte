---
"@rsvelte/compiler": patch
---

fix(transform): treat an each-item that shadows an outer binding as reactive

A text/attribute interpolation whose expression is an `{#each … as item}` loop
variable is reactive, so the client codegen must emit a
`$.template_effect(() => $.set_text(…))` rather than a one-time `nodeValue`
assignment. When the loop variable shadowed a same-named outer binding
(`const title = '…'; {#each rows as title}{title}{/each}`),
`expression_has_reactive_state` resolved the name to the outer (non-reactive)
constant — the transform-side scope is not switched to the each scope during the
body walk — and wrongly baked the interpolation as static. Mirror the existing
`get_literal_value` each-shadow guard: a name matching an enclosing each ITEM is
always reactive, an each INDEX uses its analyzer-computed reactivity. Fixes the
flowbite-svelte admin-dashboard CRUD `+page` components (client SSR/CSR).
