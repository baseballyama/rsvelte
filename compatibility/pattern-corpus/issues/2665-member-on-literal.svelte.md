# `2665-member-on-literal.svelte`

**Issue:** [#2665](https://github.com/baseballyama/rsvelte/issues/2665)

Both sides of upstream's `is_pure`, which decides a member read's reactivity by its **leftmost object**: `[1, 2].length` and `(…).name` are impure, so official emits the placeholder space a dynamic text node needs, while `"ab".length` is pure and stays a static `textContent`. rsvelte treated all three as static and emitted `<p></p>` for the first two — the text node the runtime expects to fill is not there
