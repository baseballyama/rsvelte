---
'@rsvelte/cli': patch
---

`compile` now reports a `yield` or an `arguments` inside a target that no one can assign to with Svelte's message and position, such as `(() => yield) = 1` or `(class { x = arguments }) = 1`. It also reports `(arguments) = 1` in a class static block as Svelte does.
