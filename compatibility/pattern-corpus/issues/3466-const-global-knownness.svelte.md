# `3466-const-global-knownness.svelte`

**Issue:** [#3466](https://github.com/baseballyama/rsvelte/issues/3466)

`{@const}` knownness uses the complete shared globals table: executable `Number`, `String` and `Math` entries take the one-shot path, while the marker-only `Number.MAX_SAFE_INTEGER` control remains reactive.
