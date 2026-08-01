---
"@rsvelte/compiler": patch
---

fix(compiler): give `<svelte:self>` its real source position in the dev `$.add_svelte_meta` call instead of a `1, 0` placeholder
