# `2028-console-wrap-legacy-reactive.svelte`

**Issue:** [#2028](https://github.com/baseballyama/rsvelte/issues/2028)

The same decision inside a legacy `$:` body, which is folded into `$.legacy_pre_effect(...)` after the per-statement pass has run
