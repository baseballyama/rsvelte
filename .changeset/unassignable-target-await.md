---
'@rsvelte/cli': patch
---

Report an `await` inside a target that no one can assign to, such as `(() => await x) = 1`, with Svelte's message and position again. The linter now also reads the variables inside such a target, so it no longer calls them unused.
