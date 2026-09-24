# `store-import-no-spaces.svelte`

**Issue:** [#4667](https://github.com/baseballyama/rsvelte/issues/4667)

Upstream lets `$derived` stay the rune when a `derived` is imported *from
`svelte/store`*, reading the binding's own `ImportDeclaration.source.value`.
The port asked the question of the source text instead, line by line, and its
`import ` prefix required a space, so `import{derived}from"svelte/store"`
compiled `$derived(a * 2)` as a subscription to the imported binding on both
the client and the server. The spacing is the payload, so this file is
deliberately not in formatted shape. The cells that separate the source check
from the specifier's shape — a default import from `svelte/store`, the same
name imported from another module, and a real subscription to a tightly
imported store — are in `crates/rsvelte_core/tests/store_import_source_4667.rs`.
