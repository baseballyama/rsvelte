---
'@rsvelte/compiler': patch
---

Fold an SSR constant as a JS value, not as its rendered text

`const r = '1' + '1'` rendered `2` on the server. The binding-initializer fold
carried every folded constant as a `String`, so the string `'1'` and the number
`1` were one value and `+` could not tell them apart — the same representation
defect the client fold had (#3027), on the other side of the compiler. The map
now holds `EvalValue`, the type `evaluate.rs` already used for template
expressions, which is why `{'1' + '1'}` written directly was always correct.

The operators fold through `eval_binary` instead of `parse::<f64>()` on the
rendered text, so there is one port of JS coercion here rather than two.

Two more defects lived in the same scan and are fixed with it: the split took
`*` first, which makes it the tree's root (`1 + 2 * 3` rendered `9`), and it
took the leftmost operator, which is the wrong associativity (`10 - 3 - 2`
rendered `9`). It now splits at the rightmost operator of the lowest precedence
present.

Grid — 20 expressions × 9 hosts × 3 targets, with operand pairs chosen to
collide under stringification while differing as JS values: **43 of 540 cells
diverging → 0**. Every diverging cell was `server`; the client was byte-identical
to official throughout, so only output equality could see any of it.
