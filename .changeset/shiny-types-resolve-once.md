---
'@rsvelte/svelte-check': patch
---

Stop a dependency's `/// <reference types="svelte" />` re-introducing svelte's declarations. The blanked copy of `svelte/types/index.d.ts` (the `*.svelte` wildcard fix) is reached through `paths`, which a type reference does not go through — so `@sveltejs/kit`, `@tanstack/svelte-table` and any other package whose shipped `.d.ts` opens with that directive pulled the original file back into the program beside the copy. Every ambient svelte module was then declared twice, and since `Snippet`'s brand is a `unique symbol` per declaration, a snippet was no longer assignable to `Snippet`: TS2322 on every snippet handed to a component prop (130 of them in one real SvelteKit app), with nothing wrong in the project. The reference now resolves to an empty stub package placed first in `typeRoots`, leaving the copy in `files` as the single source of those modules.
