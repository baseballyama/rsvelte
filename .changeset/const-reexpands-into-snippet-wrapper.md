---
"@rsvelte/compiler": patch
---

An enclosing `{@const}` is re-expanded into an element's snippet wrapper

`RegularElement.js:333` hands the children the parent's `consts` array itself when the element
declares none of its own, and `:443` splices that same array into the `{ … }` wrapper a
`{#snippet}` in its fragment creates.
