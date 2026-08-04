---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

Apply `remove_surrounding_whitespace_nodes` to `{#snippet}` bodies and reproduce upstream's opener gap for the standalone snippet form, and route `<svelte:boundary slot="x">` inside a component through the `$$slot_def[...]` wrapper so the generated TSX matches official svelte2tsx.
