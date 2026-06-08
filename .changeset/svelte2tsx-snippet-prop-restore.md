---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): ship the single, correct named-snippet-as-component-prop implementation. 0.1.11 accidentally merged two different fixes for #780 into `handle_component` at once (an implicit-prop relocation **and** a hoist-the-`const`-before-the-block approach), so a named `{#snippet}` child of a component was processed twice — an out-of-order double `move_range` plus a duplicate prop — producing invalid overlays. The duplicate (hoist) path has been reverted; the kept implicit-prop path emits the snippet inside the component's `props: { … }` object literal (`props: { row: ({ id }) => … }`), which both satisfies required `Snippet` props and lets TypeScript contextually type the snippet's parameters from the prop's `Snippet<[T]>` type (a destructured `{#snippet row({ id })}` no longer trips `noImplicitAny`). Verified against real `tsgo` on the #780 repro (0 errors).
