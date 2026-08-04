---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

Transform `<svelte:self>` `bind:` directives and `{#snippet}` children like a named component's: two-way bindings now emit a plain prop plus the `$$bindings` marker and setter type-widener instead of the DOM `"bind:value"` form, `bind:this` assigns the component instance, and direct snippet children are demoted to props anchored by a `$$prop_def` destructure.
