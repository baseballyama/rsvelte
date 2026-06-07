---
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): disambiguate generic arrow type-parameter lists (`<T>` → `<T,>`) in the `.tsx` overlay so they aren't parsed as JSX (#725)
