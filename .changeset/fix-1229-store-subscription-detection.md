---
"@rsvelte/compiler": patch
---

fix(compiler): detect spread/ternary store subscriptions and emit store getters in first-reference order

Three Phase-2 store-subscription detection bugs surfaced by the store-heavy
legacy layercake components in the awesome-svelte compat corpus, all affecting
the client `const $store = () => $.store_get(...)` getters:

- A store referenced only through a spread (`Math.max(...$xRange)`) was never
  detected — the lexical `$`-scan treated the third `.` of `...` like a member
  access (`obj.$x`) and skipped it, so the getter was missing entirely (broken
  reactivity). A leading dot now counts as member access only when it is a
  single dot.
- A store in a ternary consequent (`cond ? $xGet : $yGet`) was dropped because
  `$xGet :` looked like an object property key (`{ $xGet: ... }`). A property
  key is never preceded by `?`, so a ternary consequent is now excluded.
- Store getters were emitted in the wrong order: template refs were sorted by a
  substring `source.find`, so `$x` matched inside `$xGet`/`$xScale` and `$y`
  inside `$yGet`/`$yRange`. They are now kept in AST-traversal (first-reference)
  order, matching the official compiler's `scope.declarations` insertion order.

Fixes #1229 (layercake `Column` / `GroupLabels` / `QuadTree` / `AxisRadial`).
