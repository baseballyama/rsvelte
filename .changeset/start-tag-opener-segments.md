---
'@rsvelte/compiler': patch
'@rsvelte/svelte2tsx': patch
'@rsvelte/svelte-check': patch
---

fix(svelte2tsx): apply the six remaining start-tag openers as segments, not one overwrite

`<svelte:element>` was one host of a class: nine call sites build a start tag with
`format!` and apply it with a single `str.overwrite(el.start, opening_tag_end, …)`.
`magic-string` emits one segment for an `addEdit` and a segment per character for
an unedited chunk, so every expression inside such a tag shares the element's
start mapping and a request inside it resolves through the nearest mapping to its
left. Upstream never does this: `htmlxtojsx_v2`'s `transform` takes a
`TransformationArray` whose entries are strings **or `[start, end]` ranges**, and
it `move`s each range so the source chunk reaches the shadow unedited.

Six ports are converted to `build_attribute_segments` + `bake_out_of_order_src` +
`emit_segmented_overwrite`, which is the path `element.rs` has used for plain
elements since the structured bake landed: `<svelte:component>`, `<svelte:self>`,
the standard special elements (`<svelte:body>`, `<svelte:window>`,
`<svelte:document>`, `<svelte:head>`) and `handle_boundary_snippet_props`,
`<slot>`, a named-slot element and `<svelte:fragment>` inside a component, and
`<title>` inside `<svelte:head>`. `format_component_bind_directive_segments` is
the segment twin the `<svelte:self>` path needed.

The entire string attribute-building path now has no callers and is deleted —
15 functions, 514 lines, including `build_attributes_string`, which was literally
`segs_to_string(build_attribute_segments(…))`. `trailing_attr_comment_text`'s unit
test is re-pointed at `trailing_attr_comment_segs` rather than dropped, so the
assertion survives and now exercises the segment path.

The generated TSX is unchanged; only the map moves.
