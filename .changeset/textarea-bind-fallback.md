---
"@rsvelte/compiler": patch
---

Render a `<textarea>`'s own children as the SSR fallback when its content binding is falsy. The `else` branch was emitted empty, so `<textarea bind:value>fallback</textarea>` rendered nothing for an empty value; the output parses and the truthy path was right, so only output equality showed it.
