---
'@rsvelte/compiler': patch
---

Report a parse error in a `{@const}` initializer

`{#if true}{@const c = new.target}{c}{/if}` compiled. So did every other
unparseable initializer: `{@const}` reads its declaration through
`parse_js_expression`, which ends in
`.unwrap_or_else(|| create_empty_identifier(""))` — so a `js_parse_error` became
an empty identifier and the component was built around it.

This is an over-acceptance, and the population it lives in is programs the
official compiler rejects. No comparison of *accepted* programs can see it, and
no collected corpus holds it, because published code compiles.

The other template slots were already right — they call
`parse_js_expression_strict` or `parse_js_expression_attribute`, which return a
`ParseResult` — and that makes them the positive control naming the path.
`{@const}` cannot simply call the strict variant: that one defers into an
`Expression::Lazy`, and this tag inspects its parsed declaration during the
parse. The non-deferring half is now its own function and both callers share it.

Grid — 12 initializer shapes × 8 template slots × 2 targets: **102 of 192 cells
diverging → 74**. The `{@const}` slots go from 20 divergences each to 6, and the
6 that remain are causes the *other* slots have too, so the slot no longer has a
defect of its own: `{super.x}` and `#x in y` (#3694 — the real parser accepts
those, so propagating cannot reject them) and `a b` (below).

**Four cells are new, and they are an improvement that is still a divergence.**
`{@const c = a b}` moved from *accepted* to `js_parse_error`, where official
raises `expected_token`: upstream parses the declaration incrementally and lets
the tag reader complain about the leftover token, while rsvelte slices to the
matching `}` and parses the slice as one expression. The same divergence already
existed in the `attribute` and `each-collection` slots, so this fix reaches an
existing defect rather than creating one. The two pattern-side shapes
(`{@const 1 + = 2}`, `{@const 1 +}`) move the same way, from *accepted* to
`js_parse_error` against official's `expected_pattern`.
