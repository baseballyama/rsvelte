# `3035-destructure-defaults.svelte`

**Issue:** [#3035](https://github.com/baseballyama/rsvelte/issues/3035)

Destructuring defaults dropped in three client sites: the `{#each}` **key function** lost every pattern default, a **nested** pattern's `= {}` lost its `$.fallback(…, () => ({}), true)` wrapper in both the derived chain and the each-item `$$array` helper — and the rebuilt thunk printed `() => {}` (an empty function body) where the object literal needed parens
