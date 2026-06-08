---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): wire a named `{#snippet}` child of a component into its `props` object. A snippet passed to a component (`<Comp>{#snippet row(..)}…{/snippet}</Comp>`) was lowered as a standalone `const row = …` emitted *after* the instantiation, so the component was constructed with empty props and `--tsgo` reported a false `Property 'row' is missing in type '{}' but required in type '$$ComponentProps'`. The snippet is now emitted as an implicit prop inside the `props: { … }` object literal (`props: { row: (params) => … }`), mirroring upstream svelte2tsx's `addImplicitSnippetProp` — relocated there via `MagicString::move_range`. This satisfies required snippet props and lets TypeScript contextually type the snippet's parameters from the prop's `Snippet<[T]>` type (so a destructured `{#snippet row({ id })}` no longer trips `noImplicitAny`). Verified against real `tsgo` on the issue repro (0 errors). Closes #780.
