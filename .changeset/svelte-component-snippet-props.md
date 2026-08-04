---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

Demote `<svelte:component>`'s direct `{#snippet}` children to implicit props, like a named component's and `<svelte:self>`'s. They were emitted as standalone `const foo = (a) => …` declarations, so TypeScript could not contextually type the snippet parameters from the target component's props; they now move into the `props: { … }` object anchored by a `$$prop_def` destructure. The `let:` / named-slot paths keep their own block scoping and are unaffected.
