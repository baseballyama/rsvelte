---
"@rsvelte/compiler": patch
---

Fold operations on a bigint. The constant evaluator already read `1n` as a value, but every arithmetic and relational arm was gated on `to_number`, which returns nothing for a bigint — correct for JS `ToNumber`, which throws on one, and wrong for arithmetic, which uses `ToNumeric` and keeps a bigint a bigint. So `{7n + 2n}` stayed reactive where official renders `9`, and so did `~1n`, every comparison that crosses the bigint boundary (`2n == 2` is `true` while `2n === 2` is `false`), and `Number(1n)`. Mixing a bigint into arithmetic still never folds: it is a runtime `TypeError`, so the value does not exist — as are `1n / 0n`, `2n ** -1n`, `>>>` on bigints and `Math.*` of one. A result outside `i128` is declined rather than folded, so a value this port cannot represent stays reactive instead of truncating.
