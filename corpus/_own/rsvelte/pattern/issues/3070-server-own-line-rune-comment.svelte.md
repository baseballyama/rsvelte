# `3070-server-own-line-rune-comment.svelte`

**Issue:** [#3070](https://github.com/baseballyama/rsvelte/issues/3070)

Server: an own-line comment after a retained rune argument stays pending after the lowered declaration, and a leading comment inside the removed `$effect` follows it at the component-body tail. The declaration wrapper must end at the retained argument rather than claiming the removed call wrapper's source range. Client targets are the control.
