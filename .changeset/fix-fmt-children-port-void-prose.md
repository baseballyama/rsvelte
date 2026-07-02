---
"@rsvelte/fmt": patch
---

fix(fmt): wire the prettier-plugin-svelte children port for void-element + prose content

Milestone-2 layout port, cut 1. Route an inline-or-block element whose content is
prose text interleaved with single-line HTML void elements
(`<label class="…"><input … /> Only show states starting with 'T'</label>`,
`<div><br /></div>` runs) through the faithful `children.rs` port of
prettier-plugin-svelte's `printChildren` + 4-case element assembly
(`build_element_doc`), instead of the approximate `try_fill_mixed` / `try_hug_mixed`
string logic. The approximate fill construction mis-placed the prose word-wrap
boundary (it broke one word too early); the faithful port reproduces prettier's
fill — including gluing the first word to the preceding void element — byte-for-byte.

`try_children_port` returns `Some(_)` to **claim** its shape even when it produces
no edit (the content is already correct), so the legacy passes
(`collect` and `collect_fill_mixed_only`) don't re-break already-correct prose.

Burns down the fmt-parity corpus by 5 (69 known failures; svelte-maplibre
geojson_polygon / 3d_buildings, powertable example4, svelte-sonner Hero,
svelte-pivottable).
