---
"@rsvelte/svelte2tsx": patch
---

fix(svelte2tsx): widen renamed legacy prop with a typed default (#1231)

A renamed legacy prop with a default and a type — most commonly a JSDoc `/** @type {T} */` (the sveltestrap shape), e.g. `let className = ""; export { className as class }` — must still receive official svelte2tsx's `__sveltets_2_any` coercion bounded by `/*Ωignore_startΩ*/ … /*Ωignore_endΩ*/` markers. The `export { x as y }` widening predicate only fired on `!has_init || has_type_annotation`, so any renamed prop with a default dropped the coercion (and the Ω-ignore markers the language server relies on) even with a JSDoc `@type` or a boolean default. It now mirrors official `propTypeAssertToUserDefined`: widen on no-init OR a type (TS annotation or JSDoc `@type`) OR a boolean-literal initializer; a plain untyped string default is still left untouched.
