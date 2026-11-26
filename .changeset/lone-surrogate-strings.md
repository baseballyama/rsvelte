---
'@rsvelte/cli': patch
---

Fold a string with a lone surrogate, such as `{'\uD800'}`, as svelte does, instead of crashing on the client and writing `\\ud800` into a server attribute.
