---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): generate valid TSX for pending-only `{#await p}…{/await}` (and `{#await p}…{:catch e}…{/await}` with no `{:then}`). These shapes previously never opened the block, dropped the `await(promise)` entirely, and ignored the catch — producing brace-unbalanced TSX that tripped the program-wide `--tsgo` suppression. Now mirrors upstream `handleAwait`.
