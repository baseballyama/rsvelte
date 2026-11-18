# `2535-where-all-branches-unused.svelte`

**Issue:** [#2535](https://github.com/baseballyama/rsvelte/issues/2535)

`:where(.a, .miss)` with no branch matching. The all-branches-unused collapse was spelled for `:is` and `:has` but not `:where`, so rsvelte reported one warning per branch where official reports one for the rule
