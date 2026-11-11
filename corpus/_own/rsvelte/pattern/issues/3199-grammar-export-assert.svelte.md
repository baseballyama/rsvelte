# `3199-grammar-export-assert.svelte`

**Issue:** [#3199](https://github.com/baseballyama/rsvelte/issues/3199)

The same clause on a re-export. `export { x } from …` is an `ExportFromDeclaration`, a different OXC node from the `ExportNamedDeclaration` that carries no source and has no `with_clause` field at all, so the import visitor alone leaves this one accepted
