# `3190-double-dollar-slots-legal.svelte`

**Issue:** [#3190](https://github.com/baseballyama/rsvelte/issues/3190)

`$$slots` is the one reserved name runes mode still allows, so it is the control for the two that do not. It needs its own file because `$$slots` puts the component in slot syntax, and a `{@render}` anywhere beside it is `slot_snippet_conflict`
