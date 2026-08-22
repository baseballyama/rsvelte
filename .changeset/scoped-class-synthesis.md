---
"@rsvelte/compiler": patch
---

Synthesize the empty `class` attribute for a scoped element, not only for one carrying a `class:` directive. The synthesizer took `is_scoped` and ignored it, so `<svelte:element>` — whose attributes go through `$.attribute_effect` rather than the template — reached the runtime with no `class` key for the scoping hash to merge into.
