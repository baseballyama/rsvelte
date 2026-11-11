# `2726-nested-async-derived.svelte`

**Issue:** [#2726](https://github.com/baseballyama/rsvelte/issues/2726)

An `await` belonging to a nested async function inside `$derived(...)` must not turn the enclosing derived declaration into `await $.async_derived(...)`
