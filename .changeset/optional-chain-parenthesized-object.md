---
'@rsvelte/cli': patch
---

Report an assignment target whose left edge is in parentheses where svelte does. `(a)?.b = x` and `(f)() = 1` now fail at the opening parenthesis, which starts the node acorn rejects, instead of at the name inside it.

An `await` outside an async function that comes before another syntax error is now reported with svelte's wording and position, instead of the later error.
