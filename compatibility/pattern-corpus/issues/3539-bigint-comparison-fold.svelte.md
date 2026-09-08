# `3539-bigint-comparison-fold.svelte`

**Issue:** [#3539](https://github.com/baseballyama/rsvelte/issues/3539)

The half the issue's grid does not mention: mixing a bigint into a **comparison** is legal where mixing it into arithmetic throws, so this population has values to fold. `2n == 2` is `true` and `2n === 2` is `false`; `2n == '2'` coerces the string and `2n == 'x'` is `false`, not unknown; `2n < 2.5` compares exactly rather than rounding either side. `0 == '0'` is the control that must not move
