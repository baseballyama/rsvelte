---
'@rsvelte/compiler': patch
'@rsvelte/svelte2tsx': patch
'@rsvelte/svelte-check': patch
---

fix(svelte2tsx): emit a `bind:` suffix's assignment target as a source range

Upstream `Binding.ts` emits the target as a TransformationArray *range* —
`appendOneWayBinding`'s `[expression.start, end]`, and `[set.start, getEnd(set)]`
for a get/set `bind:this` — so the expression survives into the shadow as an
unedited chunk carrying its own map segments. rsvelte baked the text into the
suffix statement, so the position carried no segment and a request inside
`bind:this={el}` resolved through the nearest mapping to its left: hover answered
about the preceding `title={tag}` attribute, at that attribute's range.

Four of upstream's five suffix branches are ranges (`bind:this`, `bind:group` on
`<input>`, the on-element one-way bindings, and the not-on-element ones); only the
generic two-way widener is built from `str.original.substring` and stays literal.

The generated TSX is unchanged; only the map moves.
