---
"@rsvelte/compiler": patch
---

Fold a `<title>` whose single expression has a compile-time known value into a string literal on the client, for every literal kind. Upstream's single-value template chunk writes `b.literal((evaluated.value ?? '') + '')`, so a known `0` becomes `'0'` and a known-nullish value becomes `''`; rsvelte inlined string-valued knowns only, on the reading that a numeric one would need a numeric literal to match — which the `+ ''` refutes. The `?? ''` it emitted instead computes the same title, so only output equality can see the difference.
