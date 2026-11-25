---
'@rsvelte/cli': patch
---

`rsvelte typecheck` reads `$store` in a JavaScript component as svelte-check does. It reports a value that is no store at each read, and types an untyped custom store's value as `any`.
