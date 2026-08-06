---
"@rsvelte/compiler": patch
---

fix(compiler): find the `$props()` pattern braces lexically

`transform_props_destructuring` located the destructuring pattern with a raw
`find('{')` / `rfind('}')`, so a JSDoc type annotation ahead of it —
`let /** @type {Props} */ { a, b } = $props()`, idiomatic in JavaScript Svelte
components — made the scan start at the annotation's brace and parse
`Props} */ { a, b` as the prop list. A `}` in a trailing comment moved the
closing brace the same way.
