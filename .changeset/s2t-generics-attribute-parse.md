---
"@rsvelte/svelte2tsx": patch
---

Read the `<script generics="…">` attribute with a TypeScript parse instead of a comma scan. The scan knew only about `<…>`, so a comma at the top level of an object type, a tuple, a parameter list or a string literal split the type parameter and the fragments were emitted as *type arguments* — `<T,b:>` is not a type argument list, so the whole component's TSX stopped parsing. Whether a component has generics at all now comes from the same parse (upstream's `Generics.has()`), so an attribute that is not a type parameter list keeps the non-generic component export while still reaching `function $$render<…>` verbatim.
