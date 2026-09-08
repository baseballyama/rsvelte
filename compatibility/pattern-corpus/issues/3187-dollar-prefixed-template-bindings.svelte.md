# `3187-dollar-prefixed-template-bindings.svelte`

**Issue:** [#3187](https://github.com/baseballyama/rsvelte/issues/3187)

Every template position that BINDS a name, all carrying a `$` prefix official accepts: each item / index / destructured item, a snippet's own name and its parameter, `{@const}` in three different parents, `{#await}`'s value and error, and an arrow parameter inside a tag. rsvelte rejected all of them. They share one cause but not one call path — the snippet name is declared in the parent scope while its parameter is not, and `{@const}` is a declarator — so a file with one position cannot show the exemption is general
