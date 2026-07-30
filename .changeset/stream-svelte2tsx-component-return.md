---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

Reduce svelte2tsx transformation overhead by streaming the component return
object into its output buffer.
