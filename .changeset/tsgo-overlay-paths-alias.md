---
"@rsvelte/language-server": patch
---

Resolve a `tsconfig` `paths` alias that names a `.svelte` module.

The tsgo overlay inherited `paths` through `extends`, so an alias resolved
against the source tree — where a component's `.svelte.tsx` shadow does not
exist, because the shadow is served from memory under the cache directory.
`rootDirs` lists both trees but governs relative resolution only, so
`import Widget from '$lib/Widget.svelte'` had no type at all: hover returned
`null` and the symbol was `any`, with no diagnostic to say so.

The overlay now re-declares every mapping with its shadow-tree twin beside the
original, the original first so nothing that resolves today moves. This covers
SvelteKit's generated `"$lib/*": ["../src/lib/*"]`, which is the alias most
projects import components through.
