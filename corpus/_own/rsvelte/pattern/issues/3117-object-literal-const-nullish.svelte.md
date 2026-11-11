# `3117-object-literal-const-nullish.svelte`

**Issue:** [#3117](https://github.com/baseballyama/rsvelte/issues/3117)

Upstream's `evaluate` has a case for a function form and a template literal and none for an array or object literal, so those fall through to UNKNOWN — which includes nullish, and the `?? ''` guard stays. rsvelte treated any literal-shaped initializer as definitely defined and folded the guard away
