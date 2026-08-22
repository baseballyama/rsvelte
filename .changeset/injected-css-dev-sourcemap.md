---
"@rsvelte/compiler": patch
---

Map the injected dev stylesheet back to the `.svelte` source. Nested rules, at-rules, `@keyframes`, `:global(…)` and `:global {…}` blocks were emitted as insertions rather than copies, so the `sourceMappingURL` payload appended in dev carried no segments for them.
