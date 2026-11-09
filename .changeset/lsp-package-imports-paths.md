---
"@rsvelte/language-server": patch
"@rsvelte/svelte-check": patch
---

fix(lsp): resolve package.json `imports` (`#lib/*`) from component shadows

A component's tsgo shadow lives under the overlay cache, so its nearest
package.json was not the project's and a `#lib/...` import resolved against the
wrong `imports` map (or none); a `.svelte` target also exists only in the shadow
tree. The overlay now writes the project package's `imports` into `paths`, each
target beside its shadow-tree twin, so go-to-definition, hover and completion
follow `#lib/Card.svelte` the way they follow a tsconfig `paths` alias.
