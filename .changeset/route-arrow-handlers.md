---
"@rsvelte/svelte-check": patch
---

Fix a false `implicit any` (TS7031/TS7006) on SvelteKit route files whose
handlers are written as `const` arrow functions or function expressions
instead of `export function` declarations — e.g. `+server.js`'s
`export const GET = async ({ url, locals }) => {...}`. `kit_file.rs`'s
route-handler matcher (`add_api_method_types`) matched only
`FunctionDeclaration`, the same #1886 narrowing recurring in the route arm
after #1892 fixed it for hooks only. Audited the rest of the route-file
augmentation for the same gap: `entries` had no `const`-form handling at
all (now fixed alongside `GET`/`PUT`/`POST`/`PATCH`/`DELETE`/`OPTIONS`/
`HEAD`/`fallback`), and `params/*.js`'s `match` had the identical
`FunctionDeclaration`-only narrowing (also fixed). `load`'s `const` form
was already covered by the existing `satisfies` wrapper.

Extended the `kit-routes-js` fixture with arrow-const arms for `GET`,
`match`, and `entries` to guard against regressions of this narrowing.
