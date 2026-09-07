---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

svelte2tsx: a script's angle-bracket type-parameter list is copied into the TSX shadow verbatim. rsvelte inserted a disambiguating comma (`<T>` → `<T,>`) that upstream never inserts, which changed the program the type checker sees — `<string>() => a` is a type assertion, `<string,>() => a` is a generic arrow whose type parameter is named `string`.
