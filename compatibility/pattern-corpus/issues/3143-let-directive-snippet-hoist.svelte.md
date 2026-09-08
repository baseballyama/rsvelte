# `3143-let-directive-snippet-hoist.svelte`

**Issue:** [#3143](https://github.com/baseballyama/rsvelte/issues/3143)

A `let:`-bound name read as instance-level inside a snippet, so the snippet was pinned. The file carries the directive on a component and on a slotted element — the scope begins at whichever node writes it, not only at a component — plus a third snippet that also reads `$state` and must stay pinned
