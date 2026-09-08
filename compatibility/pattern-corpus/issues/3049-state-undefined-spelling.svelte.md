# `3049-state-undefined-spelling.svelte`

**Issue:** [#3049](https://github.com/baseballyama/rsvelte/issues/3049)

A non-reassigned `$state(undefined)` keeps the spelling the source used (`undefined`, not `void 0`), and `$state(void 0)` is a KNOWN undefined to both folders — official folds `<p>{a ?? 'a'}{b ?? 'b'}…</p>` to `p.textContent` across all four spellings
