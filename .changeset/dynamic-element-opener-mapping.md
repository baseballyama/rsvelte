---
'@rsvelte/compiler': patch
'@rsvelte/svelte2tsx': patch
'@rsvelte/svelte-check': patch
---

fix(svelte2tsx): apply a `<svelte:element>` opener as segments, not one overwrite

`handle_svelte_dynamic_element` built the whole opening tag as a string and
applied it with a single `str.overwrite(el.start, opening_tag_end, …)`, so the
`this={…}` expression and every attribute value reached the shadow as generated
text with no map segment. `textDocument/hover` inside a `<svelte:element>` start
tag answered `null` where official answers, because official builds the same
opener from a TransformationArray whose expression entries are source ranges.

The opener now goes through `build_attribute_segments` + `bake_out_of_order_src`
+ `emit_segmented_overwrite`, which is what the plain-element path
(`element.rs`) already did. `this="div"` keeps no range — the parser stores the
bare text — so it stays generated, matching upstream.

The generated TSX is unchanged; only the map moves.
