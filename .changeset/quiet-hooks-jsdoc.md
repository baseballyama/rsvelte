---
"@rsvelte/svelte-check": patch
---

Fix a residual false `implicit any` on SvelteKit hooks written as
`export function handle(...) {...}` in plain JS/JSDoc (not TypeScript):
the `/** @type {Handle} */` annotation was inserted between `export` and
`function`, which TypeScript silently ignores. A JSDoc `@type` tag only
re-types a `function` declaration when it leads the *entire* exported
statement — matching the official implementation, whose
`ts.FunctionDeclaration.getStart()` includes the `export` modifier in the
node's own span. Every binding element of the hook's destructured
parameter stayed implicit `any` despite the annotation being present in
the overlay.

The `const` + arrow-function/function-expression form (`export const
handle = (...) => {...}`, fixed by #1892) already anchored the JSDoc
annotation correctly and is unaffected.

This completes #1886's fix for the JSDoc/JS path (closed by #1892, but
the `kit-hooks-js` fixture still diverged for the plain `export function`
hooks).
