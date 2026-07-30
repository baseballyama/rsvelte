---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

Reduce svelte2tsx instance-script work by collecting import ranges during the
existing top-level statement traversal.
