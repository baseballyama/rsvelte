# `4082-global-parent-ancestor-walk.svelte`

**Issue:** [#4082](https://github.com/baseballyama/rsvelte/issues/4082)

A parent prelude that opens with `:global(...)` made the nested rule's ancestor walk abandon the level entirely — `collect_relative_selector_branches` found no structurally-evaluable branch, so `build_parent_chains` returned `None` and every later check saw an unresolvable `&`. A `.a &` / `.a > &` child was then kept and unwarned where official prunes it, because upstream's `apply_combinator` BACKWARD escape (`every_is_global`) treats a wholly global prefix as matching whatever sits above the component and continues from the first local compound. `& .a` is the control that was already right and must stay kept.
