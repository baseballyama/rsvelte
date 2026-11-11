# `2535-is-argument-child-combinator.svelte`

**Issue:** [#2535](https://github.com/baseballyama/rsvelte/issues/2535)

`:is(.a) > .b` with `.a` a sibling rather than the parent. The `:is()` argument has to constrain the compound the structural walker matches; without that the whole selector stayed alive and the warning landed on the inner branch instead of the rule
