# `element-bind-prop-indirect-invalidation.svelte`

**Issue:** [#4028](https://github.com/baseballyama/rsvelte/pull/4028)

A native element binding through a computed member of a legacy prop must invalidate that prop exactly once. The indirect-invalidation pass must not add a second setter around the bind setter's existing mutation lowering.
