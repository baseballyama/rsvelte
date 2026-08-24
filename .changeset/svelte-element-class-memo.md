---
'@rsvelte/compiler': patch
---

Bind the memoized parameter on `<svelte:element>`'s effect

A `class:` directive on `<svelte:element>` whose value needs memoizing produced
`$.template_effect(() => classes = $.set_class($$element, 0, '', null, classes, $0))`
— a body reading a `$0` that is bound nowhere. The output parses, so the parse
oracle is blind to it; it throws `ReferenceError: $0 is not defined` on first
render.

Upstream's `SvelteElement` visitor gives its inner context `memoizer: new
Memoizer()` and closes it with `build_render_statement`, which reads that
memoizer's parameters. rsvelte assembled the same `template_effect` by hand with
a hard-coded empty parameter list and never installed the inner memoizer, so the
entry `build_set_class` had just added went to the *enclosing* memoizer — where
its parameter is bound by a different function. The dynamic-element visitor now
swaps in a child memoizer for the attribute pass and drains it through the same
`build_render_statement_with_memoizer` every other element path uses.

The inner memoizer being its own is the second half of the fix, not a detail: a
memo on an enclosing element is `$0` there and the dynamic element's is `$0`
again, so sharing one memoizer would renumber the inner slot to `$1`.

`style:` and plain attributes were already correct — they reach
`$.attribute_effect`, which builds its own parameter list — and so was the same
directive on a regular element.

Grid — 4 hosts × 6 directive slots × 10 value shapes × 6 compile modes:
**300 of 1440 cells diverging → 216**, with **0 new**. Every removed cell is a
`class:` slot on a dynamic element; the 216 that remain are the pre-existing
`experimental.async` divergences the grid also crosses, and none of them move.
