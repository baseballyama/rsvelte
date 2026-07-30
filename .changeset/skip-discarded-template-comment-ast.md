---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

Reduce svelte2tsx parse time and memory by skipping discarded template
comment AST conversion when comments are not requested.
