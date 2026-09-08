# `reactive-state-shadowed-by-callback-param.svelte`

**Issue:** corpus residue

A `$:` body is handed to its transforms **without** the component-level declarations, so the state variable reads as an unresolved name there and every pass that keyed on the name alone claimed a callback parameter of the same name: `stats.totalPlays += …` became `$.mutate(stats, $.get(stats)…)`, `count = 1` became `$.set(count, 1)` and `count++` became `$.update(count)`. The instance-script twin of the first of those (`legacy_state_member_mutate_ast`) had resolved through `oxc_semantic` since it was written — see `two-ports-inventory.md` row 17. `later()` writes both variables from an unshadowed position as the positive control.
