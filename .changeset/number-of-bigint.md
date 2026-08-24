---
'@rsvelte/compiler': patch
---

Fold `Number(<bigint>)`

`Number(1n)` was the one global call neither target folded, so it stayed in the
output where official writes `1`. `to_number` refuses a bigint on purpose —
`1n + 1` is a TypeError, so the arithmetic operators must not coerce one — and
the globals table reached `Number(x)` through the same helper. `Number(x)` is
the exception: it is ToNumber, which is defined for a bigint.

The exception is narrow by construction. `Number.isInteger(1n)` still folds to
`false`, `BigInt(3)` still folds to nothing (its result is a bigint the template
would have to render), and `1n + 1` is still emitted verbatim — which is also
the input that crashes the official compiler outright
(`upstream_issues/3054-svelte-bigint-mix-compile-crash.md`).

Grid — 16 global calls × 6 hosts × 3 targets: **17 of 288 cells diverging → 0**.
