# `3182-export-let-initializer-error.svelte`

**Issue:** [#3182](https://github.com/baseballyama/rsvelte/issues/3182)

`export let x = $host()` — two correct diagnostics competing, where the question is only which one is reported. Upstream visits children first, so the rune error wins
