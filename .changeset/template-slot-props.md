---
'@rsvelte/cli': patch
---

`typecheck` now types a `<slot>` prop that reads an `{#each}` item, an `{#await}` value or a component's `let:` name, as svelte-check does. A parent's `let:` of that prop was `any` before.
