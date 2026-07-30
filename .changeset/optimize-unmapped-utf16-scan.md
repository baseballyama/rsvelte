---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

Reduce svelte2tsx source-map overhead by scanning unmapped UTF-8 content once
while updating generated UTF-16 columns.
