---
"@rsvelte/svelte-check": patch
---

Fix a plain `.ts`/`.js`/`.svelte.ts` source file's `paths`-aliased `.svelte`
import never resolving to the component's real type. Only `.svelte` files go
through svelte2tsx, so `rewrite_aliased_svelte_imports` never touched a plain
source file that imports a `.svelte` component the same way — the alias fell
back to the ambient `declare module '*.svelte'` wildcard, surfacing either as
`Module '"*.svelte"' has no exported member 'X'` (a named `<script module>`
export) or `Type 'Comp' is not generic` (a default import used as a generic
type annotation). This also cascaded into any `.svelte` file that consumed a
type declared this way, reporting a spurious mismatch against the (correctly
typed) component.

For every discovered `.svelte` file reachable through a `paths` alias, the
overlay tsconfig now adds an exact (non-wildcard) `paths` entry redirecting
that specific specifier straight at the component's shadow `.tsx` — since the
resolved target no longer ends in `.svelte`, the ambient wildcard is never
consulted, regardless of which kind of file does the importing. The original
`paths` (including unrelated entries) is preserved; only this component's
own alias gets a more specific override alongside it.

Restating `paths` in the overlay tsconfig follows TypeScript's own resolution
rules: targets resolve against `baseUrl` when one is set (including one
inherited through `extends`), else against the directory of the config that
declared `paths`, and every target of a multi-target entry is kept.

Fixes #1888.
