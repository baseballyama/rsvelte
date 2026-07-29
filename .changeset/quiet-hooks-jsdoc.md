---
"@rsvelte/svelte-check": patch
---

Fix a residual false `implicit any` on SvelteKit files written as plain
JS/JSDoc `export function` declarations (not TypeScript): hooks
(`handle`/`handleError`/`handleFetch`/`reroute`), route `load`/`entries`,
`+server.js` request-method handlers (`GET`/`POST`/...), and
`params/*.js`'s `match` all prepended their `/** @type {...} */` or
`/** @param {...} */` JSDoc annotation between `export` and `function`,
which TypeScript silently ignores. A JSDoc tag only re-types a `function`
declaration when it leads the *entire* exported statement — matching the
official implementation, whose `ts.FunctionDeclaration.getStart()`
includes the `export` modifier in the node's own span. Every affected
parameter stayed implicit `any` despite the annotation being present in
the overlay.

The `const` + arrow-function/function-expression form (`export const
handle = (...) => {...}`, fixed by #1892) already anchored the JSDoc
annotation correctly and is unaffected.

This completes #1886's fix for the JSDoc/JS path (closed by #1892, but
the `kit-hooks-js` fixture still diverged for the plain `export function`
hooks) and fixes the same latent bug across the other four JSDoc-emitting
paths in `kit_file.rs`, previously untested by the diagnostic-parity gate
— added a new `kit-routes-js` fixture covering all four.
