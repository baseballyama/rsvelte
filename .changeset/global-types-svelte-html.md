---
"@rsvelte/svelte-check": patch
---

Track the installed Svelte's element typings instead of a frozen snapshot.
The overlay used to inject the vendored `svelte-jsx-v4.d.ts` unconditionally,
whose hand-enumerated `svelteHTML.IntrinsicElements` predates every tag
`svelte/elements` has gained since the shim was copied — so a post-snapshot
element's props fell through to the interface's
`[name: string]: { [name: string]: any }` catch-all and became bare `any`
(#1889's `<svelte:boundary onerror>` was one instance of that class).

svelte2tsx's `get_global_types` is now ported: when the project's own
`<sveltePath>/svelte-html.d.ts` exists (Svelte 4+), it is added to the program
and the vendored JSX shim is dropped. That file extends `SvelteHTMLElements`
from the installed `svelte/elements`, so element and attribute types follow the
user's Svelte version instead of a copy date. Projects where `svelte` cannot be
resolved from the workspace keep the vendored shims as a fallback.
