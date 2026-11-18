# `2177-each-item-destructure-cache.svelte`

**Issue:** [#2177](https://github.com/baseballyama/rsvelte/issues/2177)

A legacy destructuring **assignment** inside a template expression (event handler) whose right-hand side is an each-block item — `should_cache` must be decided from the *visited* RHS (`item` → `$.get(item)`), so it caches into a `$$value` IIFE like upstream instead of staying an uncached sequence / re-reading the item
