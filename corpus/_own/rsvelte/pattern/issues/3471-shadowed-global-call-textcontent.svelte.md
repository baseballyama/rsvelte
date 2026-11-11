# `3471-shadowed-global-call-textcontent.svelte`

**Issue:** [#3471](https://github.com/baseballyama/rsvelte/issues/3471)

A local `const Math` shadowing the global. Upstream's `get_global_keypath` returns null once `scope.get(name)` resolves, so the call is UNKNOWN and the element must stay reactive. Green both before and after #3471 on purpose: it is the control for the guard that fix had to add, since a globals table that keys on the keypath alone breaks exactly this file
