---
'@rsvelte/compiler': patch
---

A TypeScript grammar rule `acorn-typescript` does not implement is no longer a
parse error outside a `<script>`. `ACORN_UNCHECKED_TS_GRAMMAR_RULES` was missing
TS2368 and was consulted by the two script-side sites only, so
`{<string>() => a}` was rejected in a template, an attribute, a block
expression, a snippet parameter and a `{@render}` argument while the identical
source compiled in a `<script>`. The eight probes now share one decision, and
the server's own expression re-parse joins it — without that half the
over-rejection turns into a silently dropped expression rather than an error.
