---
"@rsvelte/compiler": patch
---

Reject `<svelte:self>` inside an `{#await}` branch or a `<svelte:component>`, as the official compiler does. Upstream accepts exactly `{#if}`, `{#each}`, `{#snippet}` and a `Component` as the ancestor that licenses it; rsvelte tested `block_depth`, which the `{#await}` visitor also increments, OR `component_depth`, which `<svelte:component>` also increments. Both counters exist for other rules and are one notch too generous for this one, so the check now has a counter of its own.
