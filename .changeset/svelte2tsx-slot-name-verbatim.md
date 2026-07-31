---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): key `<slot name={expr}>`'s `__sveltets_createSlot(...)` call
with the verbatim source text of the `name` attribute's value node, braces and
inner whitespace included, instead of re-serializing the expression. Upstream's
`surroundWith` wraps the raw `[start, end]` source slice in quotes rather than
printing the parsed expression, so `name={n}` must produce `"{n}"`, not `"n"`.
Also stop concatenating multi-part attribute values (`name="a{b}c"`) — upstream
only ever reads `value[0]`.
