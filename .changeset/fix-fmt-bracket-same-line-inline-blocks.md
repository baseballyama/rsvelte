---
"@rsvelte/fmt": patch
---

Honour `bracketSameLine` in the children-port pass so an element whose first child is an inline `{#if}` / `{#each}` block keeps the wrapped open tag's `>` glued to the last attribute instead of dangling it onto its own line, matching prettier-plugin-svelte.
