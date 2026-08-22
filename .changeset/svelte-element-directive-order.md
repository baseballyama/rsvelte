---
"@rsvelte/compiler": patch
---

Emit `<svelte:element>` directives in source order. `bind:`, `use:`, `transition:`, `animate:` and `{@attach}` all reach one `context.visit` pass upstream, but rsvelte collected each kind into its own list and ran five loops over them, so `bind:this` written before `use:` came out after it. Regular elements were already correct, which is why only a specific relative order of two different kinds on `<svelte:element>` diverged.
