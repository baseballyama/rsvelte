---
"@rsvelte/compiler": patch
---

fix(client): `svelte-ignore ownership_invalid_mutation` reaches a special element and not a component binding

Upstream registers a `bind:` setter's assignment in `ignore_map` per node, so an
enclosing `<!-- svelte-ignore ownership_invalid_mutation -->` reaches
`<svelte:window>`, `<svelte:document>` and `<svelte:body>` — which rsvelte left
out of the inherited-ignore walk — while a component binding is built with a bare
`b.assignment` that is never registered, so the comment does not reach it.
rsvelte had both directions backwards.
