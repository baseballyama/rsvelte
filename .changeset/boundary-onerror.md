---
"@rsvelte/svelte-check": patch
---

Fix `<svelte:boundary onerror={e => ...}>`'s callback parameter reporting a
false `implicit any`. The embedded `svelte-jsx-v4.d.ts` shim's
`IntrinsicElements` had no `'svelte:boundary'` entry, so the generated
`svelteHTML.createElement("svelte:boundary", { onerror: ... })` call fell
through to the interface's `[name: string]: { [name: string]: any }`
catch-all — every prop (including `onerror`) contextually typed as bare
`any`, which doesn't propagate a parameter type to an inline arrow function
the way an actual function-typed prop would.

Added the missing `'svelte:boundary'` entry (`onerror`/`failed`/`pending`,
mirroring `svelte/elements`' own `SvelteHTMLElements['svelte:boundary']`),
matching how `'svelte:window'`/`'svelte:body'`/`'svelte:document'` are
already declared in the same interface.

Fixes #1889.
