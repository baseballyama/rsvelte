---
'@rsvelte/compiler': patch
---

Report a template `js_parse_error` at the token, not past it

`{break}` was reported at the byte **after** `break`; official reports the `b`.
The delta was exactly the offending token's length, so `{continue}` was eight
bytes late and `{do}` two.

`check_js_parse_error_with_pos` computes `label.offset() + label.len()`, which
is right when OXC's label is *what it consumed* and wrong when the label IS the
offending token — acorn stops at that token and reports there. Two message
classes are the second kind: `Unexpected token`, where OXC labels the token it
could not use, and `Expected X but found Y`, where it labels the found token.
The default stays the label's end.

The rule needed its own predicate rather than two more entries in the existing
`at_label_start` set, because that flag does double duty — it also rewrites the
message to `Assigning to rvalue`.

Grid — 30 reserved words × 2 shapes + `new.target`, × 3 slots, keeping only the
cells where both compilers raise `js_parse_error` so the comparison has a
counterpart: **148 of 183 diverging → 2**. `{class}` cannot separate the two
rules (the found token is the wrapper's own `)`, and the clamp puts both answers
on the same byte), so the discriminating case is `{class.x}`.

The two that remain are `{const}` and `{const.x}`, and they are not this rule:
upstream matches `/(?:let|const)\b/y` first and reads a *declaration*, so acorn
consumes the keyword and reports where a declarator name should have been.
rsvelte has no such routing — that is #3692 — and the two agreed before only by
coincidence, both landing on the same byte for different reasons.

None of these positions existed before the reserved-word gate was widened: the
programs were accepted, so there was nothing to report. Closing an
over-acceptance is what made this axis observable, which is the usual shape —
shrinking one gate grows the population another one compares.
