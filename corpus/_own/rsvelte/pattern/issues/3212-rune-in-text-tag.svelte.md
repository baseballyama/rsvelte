# `3212-rune-in-text-tag.svelte`

**Issue:** [#3212](https://github.com/baseballyama/rsvelte/issues/3212)

`{$state(1)}` in a text tag. The placement rules live in the script visitor, and a template expression is walked by a second, hand-rolled traversal that hard-coded one of them (`{@const}`) instead of calling them
