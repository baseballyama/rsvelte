---
"@rsvelte/compiler": patch
---

fix(css): guard multi-relative chain resolution against non-lexical ancestry (#1735)

The `+`/`~` prune check resolves a multi-relative operand (`:global(.a .z) + .b`,
or a bare `&` against a `.foo > .a` parent prelude) into an ancestor chain
verified by walking `parent_idx`. That walk is lexical, so it silently
mis-answers for `{#snippet}` bodies (whose real ancestors come from their
`{@render}` call sites) and for `<selectedcontent>` (which mirrors the selected
`<option>`'s subtree). Both `Chain` producers now share the predicate the
descendant-chain check already used and bail conservatively when the ancestry is
not lexical, fixing `selectedcontent > .a { & + & }` being emitted as
`/* (empty) */` where the official compiler keeps it.
