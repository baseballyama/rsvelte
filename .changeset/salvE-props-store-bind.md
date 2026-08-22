---
'@rsvelte/compiler': patch
---

Three legacy-mode client-output fixes. A binding named `$$props` is now renamed to `$$sanitized_props` on both the client and the server (#3192); a store that arrives as a prop and is written through `bind:` now reads its source through the prop getter instead of the bare name, which threw `TypeError: store.set is not a function` at runtime (#3273); and `$$restProps` now gets the synthetic `rest_prop` binding upstream declares, so a template read of it reaches `$.template_effect`'s dependency-array form and an `{#each}` over it is generated reactive (#3275).
