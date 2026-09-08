---
'@rsvelte/compiler': patch
'@rsvelte/svelte2tsx': patch
'@rsvelte/svelte-check': patch
---

fix(svelte2tsx): give a component's tag name its own source range

`handle_component` interpolated the tag name into the
`__sveltets_2_ensureComponent(<name>)` header with `format!`, so the name
reached the shadow as generated text with no map segment and
`textDocument/hover` on a `<Comp />` tag answered `null`. Upstream pushes
`[nodeNameStart, nodeNameEnd]` — a source range — into that exact position
(`InlineComponent.ts:101-110`), and `<svelte:component this={…}>` is the same
shape with `[node.expression.start, node.expression.end]`.

Both now go through `segs_push_src`, so the name and the `this` expression reach
the shadow as unedited source chunks. The generated TSX is unchanged; only the
map moves.
