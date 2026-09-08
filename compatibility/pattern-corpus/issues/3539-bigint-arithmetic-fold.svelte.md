# `3539-bigint-arithmetic-fold.svelte`

**Issue:** [#3539](https://github.com/baseballyama/rsvelte/issues/3539)

Arithmetic on a bigint. The fold read `1n` as a value but gated every operator on `to_number`, which returns nothing for a bigint — right for JS `ToNumber`, which throws on one, wrong for arithmetic, which uses `ToNumeric`. Negative operands are in the file because bigint `/` truncates toward zero, `%` follows the dividend and `>>` is arithmetic — a fold routed through a double gets all three wrong — and `2n ** 64n` / `9007199254740993n + 1n` are past f64's exact-integer range, which no number fold can reach. The plain `7 + 2` and the never-operated-on `1n` are the controls
