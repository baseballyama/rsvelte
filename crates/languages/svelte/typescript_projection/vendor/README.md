# Vendored files

| File | From | License |
|---|---|---|
| `svelte-jsx-v4.d.ts` | `svelte-check@4.7.6`, `dist/src/svelte-jsx-v4.d.ts` (sveltejs/language-tools) | MIT, `LICENSE.language-tools` |
| `svelte-shims-v4.d.ts` | `svelte-check@4.7.8`, `dist/src/svelte-shims-v4.d.ts` (sveltejs/language-tools) | MIT, `LICENSE.language-tools` |

`svelte-jsx-v4.d.ts` declares `svelteHTML.createElement`, which the type-check projection calls for
every element, so attribute types (and their messages) come from the same declarations svelte-check uses.

`svelte-shims-v4.d.ts` declares the global types svelte-check adds to every project, such as
`SvelteStore`, so a component that names one resolves it as under svelte-check.
