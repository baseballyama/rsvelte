---
"@rsvelte/svelte-check": patch
---

svelte-check: type SvelteKit `load` parent/streamed data correctly by
co-locating a rewritten `$types.d.ts` (and any sibling `proxy+layout.ts` /
`proxy+page.ts`) with each route's shadows, pointing them at the **injected**
mirror route file instead of the raw on-disk source.

svelte-kit's generated `$types.d.ts` derives `PageData` / `LayoutData` from
`ReturnType<typeof import('…/+layout.js').load>`. In the overlay (subprocess)
model that specifier resolves — via `rootDirs` — to the *source* `+layout.ts`,
whose `load` event is un-annotated, so an un-typed `await parent()` collapses
parent/streamed props to `any`. `materialize_kit_files` already writes an
injected mirror (`(…) satisfies LayoutLoad`) that types the event, but nothing
referenced it. Official svelte-check avoids this only because its in-memory
language service serves the injected text *as* the source file's content; a
subprocess driver (tsc/tsgo over a real overlay dir) can't overlay on-disk
content.

The fix co-locates the rewritten `$types` (an exact-directory match that wins
over the `rootDirs` route to the source copy — no global `rootDirs`
reordering, so non-kit resolution is untouched) and, for routes whose `load`
carries an explicit `: LayoutLoad` annotation (where svelte-kit emits a
`@ts-nocheck` `proxy+layout.ts`), copies the proxy alongside so the whole
type chain stays on the mirror tree.

Verified end-to-end against a large SvelteKit app: the remaining 2
`implicitly has an 'any' type` false positives clear (**140 → 0**, matching
official svelte-check's in-memory mode). Confirmed it is a genuine typing fix,
not error suppression: across six injected-error probes (parent/streamed
`navItems` in both a plain and a proxy route, `load`-body errors in both, a
plain `.svelte` script error, and a cross-package design-system prop misuse)
the overlay reports the exact same diagnostics as official svelte-check's
ground-truth mode — i.e. `navItems` is typed as its real type, so real errors
are still caught.
