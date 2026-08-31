---
"@rsvelte/compiler": patch
---

`parse()` now emits an import or export's `with { … }` attributes and a dynamic
import's second argument, and matches acorn-typescript's node shapes under
`lang="ts"` (no empty `attributes`, `arguments` instead of `options`, an
`exportKind` on `export default`). Compiled output is unchanged.
