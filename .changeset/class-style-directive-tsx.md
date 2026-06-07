---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): lower `class:`/`style:` directives as statements after the element's `createElement(...)` call instead of as `HTMLProps` object keys, so `--tsgo` no longer reports false `'"class:NAME"' does not exist in type 'HTMLProps<…>'` excess-property errors (#750)
