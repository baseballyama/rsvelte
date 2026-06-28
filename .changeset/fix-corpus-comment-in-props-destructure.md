---
"@rsvelte/compiler": patch
---

fix(compiler): ignore comments when splitting `$props()` destructuring declarators

`split_declarators` (used to parse the names in a `let { … } = $props()`
destructuring for the `$.rest_props(…)` exclusion list) split on every top-level
comma, including commas inside `//` and `/* … */` comments. A comment such as

```js
let {
  class: className,
  // we add name, color, and stroke for compatibility with different icon libraries props
  name,
  ...restProps
} = $props();
```

was split on its internal commas, so the comment fragments leaked into the
emitted `new Set([…])` exclusion list as bogus prop names — producing an
unterminated-string / invalid-JS output. The same shape with a trailing
`// comment, with commas` after a real prop corrupted the following names.

Make `split_declarators` comment-aware (skip `//` to end-of-line and `/* … */`,
respecting string literals and not self-closing a `/*/`). The comment text stays
with the declarator and is stripped per-declarator by the existing caller logic.
Clears `flowbite-svelte/.../ClipboardManager.svelte` and
`shadcn-svelte/.../spinner/spinner.svelte` from the corpus baseline (56 → 54).
