---
'@rsvelte/compiler': patch
---

Drop the whole-output TypeScript strip from SSR codegen and erase type-only syntax in the template source-slice reparse instead. Fixes `{@const}` initializers with TypeScript-annotated arrow parameters (e.g. `{@const f = (d: T) => …}`) leaking TypeScript into the generated server output.
