# `3566-export-type-only-declaration.svelte`

**Issue:** [#3566](https://github.com/baseballyama/rsvelte/issues/3566)

Two `export`s an instance script must **not** count as component exports. Upstream's `ExportNamedDeclaration` visitor visits the declaration first and returns `b.empty` when the visit emptied it, so a type-only `export namespace` disappears; rsvelte judged the export before the visit, so once #3417 made the namespace body survive parse, the export survived with it and the component gained a `$$props` parameter — a change to its calling signature, not a byte difference, and one both the parse gate and dev mode are blind to (dev emits `$$props` regardless, so only prod discriminates). The `export {};` beside it is the specifier half of the same visitor: an export whose specifier list filters to nothing — including one written with none — is empty upstream
