# `3182-export-let-still-rejected.svelte`

**Issue:** [#3182](https://github.com/baseballyama/rsvelte/issues/3182)

The control the move needs: a runes-mode `export let` whose initializer raises nothing, so `legacy_export_invalid` must STILL fire. Note it takes a rune elsewhere in the script to be in runes mode at all — `export let x = plain` alone is legacy mode and compiles, which is why that shape is not the control it looks like
