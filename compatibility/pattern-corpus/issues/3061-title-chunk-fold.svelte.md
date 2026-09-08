# `3061-title-chunk-fold.svelte`

**Issue:** [#3061](https://github.com/baseballyama/rsvelte/issues/3061)

A known const chunk inside a DYNAMIC `<svelte:head><title>` folds into the quasi text upstream (`` `Zoo — ${name}` ``, not `` `${site} — ${name}` ``); the #3044 whole-title fold only covered the all-chunks-known case
