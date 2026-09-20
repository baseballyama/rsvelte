---
"@rsvelte/compiler": patch
---

`parse()` gives `<svelte:options customElement={{…}}>` the shape upstream builds: `props` is the evaluated `{ [name]: { attribute?, reflect?, type? } }` object rather than the option's AST, a `ShadowRootInit` goes into `shadow` itself rather than a second `shadow_object` field, and the four options are read in upstream's `tag` → `props` → `shadow` → `extend` order from each key's first occurrence, so which option a malformed object is reported on no longer depends on the order the source wrote them in.
