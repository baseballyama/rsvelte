# `2028-console-wrap-evaluate.svelte`

**Issue:** [#2028](https://github.com/baseballyama/rsvelte/issues/2028)

The dev `$.log_if_contains_state(...)` wrap follows `scope.evaluate(arg).has_unknown` — a `$state` object wraps, while a template literal, a `+`/`===` operand, `$effect.tracking()` and a `$state(0)` read do not, in the script **and** in template positions
