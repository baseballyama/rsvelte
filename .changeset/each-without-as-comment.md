---
'@rsvelte/cli': patch
---

An `{#each}` block without `as` now ends its expression where Svelte does, so a comment or a closing parenthesis after the expression is an error.
