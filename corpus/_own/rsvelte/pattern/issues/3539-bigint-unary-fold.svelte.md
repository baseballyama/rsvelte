# `3539-bigint-unary-fold.svelte`

**Issue:** [#3539](https://github.com/baseballyama/rsvelte/issues/3539)

`~1n` is `-2n` and stays a bigint, where `~` on anything else goes through `ToInt32`; `typeof` and `!` already worked, so they pin the arms that must not change. `2n + 'x'` and the template interpolation are there because `+` reaches a bigint through the string path instead of the numeric one, and that path was already correct — a file carrying only arithmetic cannot tell the two apart
