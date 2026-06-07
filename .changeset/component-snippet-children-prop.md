---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): don't synthesize a `children` prop when a component's only children are `{#snippet}` blocks (or comments/whitespace), so `--tsgo` no longer reports a false `'children' does not exist in type '$$ComponentProps'`. Mirrors upstream `handleImplicitChildren`. (partial fix for #752 — snippet-parameter typing is tracked separately)
