# `3056-console-wrap-derived-by.svelte`

**Issue:** [#3056](https://github.com/baseballyama/rsvelte/issues/3056)

dev-mode `console.log(late)` where `late = $derived.by(() => expr)`: upstream evaluates the arrow's **expression body** (scope.js `case '$derived.by'`), so a body folding to a typed value does NOT get the `$.log_if_contains_state` wrap; rsvelte treated every `$derived.by` as unknown and wrapped. Semicolon-free on purpose — the statement boundaries come from ASI
