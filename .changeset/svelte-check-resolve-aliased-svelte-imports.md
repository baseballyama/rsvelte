---
"@rsvelte/svelte-check": patch
---

svelte-check: resolve tsconfig-alias `.svelte` imports (e.g. `$lib/Foo.svelte`)
to their shadow `.tsx` so type-checking sees the real component type.

The overlay bridges each `.svelte` source to its generated shadow `.tsx` via
`rootDirs`, but TypeScript applies `rootDirs` only to **relative** specifiers —
an aliased import (`import X from '$lib/Foo.svelte'`) is resolved through
`paths` and lands on the raw source `.svelte`, where no `.tsx` shadow exists.
The component therefore resolved to `any` (every callback prop became a
spurious `TS7006` implicit-any) or, when a sibling `Foo.svelte.ts` companion
existed, to the companion (spurious `TS1192` "no default export").

Each generated shadow's non-relative `.svelte` import is now pre-resolved with
`oxc_resolver` (which honours the project tsconfig `paths`/`baseUrl`/`extends`)
and rewritten to a concrete relative path at the target's shadow `.tsx`, so the
backing TypeScript compiler resolves it directly — matching what official
svelte-check achieves with its in-memory `resolveModuleNames` hook. On a large
SvelteKit app this dropped reported errors from 140 to 43 (the remainder are
unrelated SvelteKit route-load typing and companion-module edges).
