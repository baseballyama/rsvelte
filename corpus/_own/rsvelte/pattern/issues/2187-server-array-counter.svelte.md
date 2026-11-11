# `2187-server-array-counter.svelte`

**Issue:** [#2187](https://github.com/baseballyama/rsvelte/issues/2187) / [#2196](https://github.com/baseballyama/rsvelte/issues/2196)

Server: two SEPARATE array-pattern `$state(...)` declarations in one script must deconflict their `$.to_array` temp — `$$array`, `$$array_1` — instead of both emitting `$$array` (the counter must be component-wide, not reset per declaration). Client: a pattern that mixes a reassigned and a never-reassigned name still instruments the reassigned one — `a++` → `$.update(a)` — since the non-reactive shadow decision is per name, not per pattern
