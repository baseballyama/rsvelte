# `3156-attr-tilde-both-directions.svelte`

**Issue:** [#3156](https://github.com/baseballyama/rsvelte/issues/3156)

`[class~=…]` was wrong in both directions at once, so the file carries both: the dynamic element makes `[class~='a']`, `#i` and `[data-v='1']` rules that must survive, and the non-matching `class:zz` makes `[class~='q']` a rule that must be pruned. A one-direction file would pass under a fix that simply flipped the default
