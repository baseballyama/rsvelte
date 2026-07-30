---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

Reduce svelte2tsx output allocation by reserving the exact generated
MagicString bundle code size.
