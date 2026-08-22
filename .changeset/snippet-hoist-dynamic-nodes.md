---
"@rsvelte/compiler": patch
---

Hoist a root-level `{#snippet}` whose body contains `<svelte:element>` or `<svelte:self>` when nothing in it reaches instance state. Both node types were rejected outright, where upstream's `can_hoist_snippet` never inspects node types at all — it walks the snippet scope's references and judges each binding. `<svelte:self>` contributes no reference of its own and `<svelte:element>` contributes only its `this` expression and attributes, which is the check the neighbouring `<svelte:component>` arm already performed.
