---
'@rsvelte/language-server': patch
---

fix(lsp): css diagnostics read declarations, not the first colon on a line

`css::diagnostics` took the first `:` on each line of a `<style>` body, so a
selector's own pseudo-class was reported as an unknown property (`a:hover` on
its own line reports `a`) and every declaration after the first `;` on a line
was invisible. It now walks the body tracking brace depth, comments and string
literals, and reads a property only from a chunk that sits inside a block —
which is what `vscode-css-languageservice` gets from a parsed stylesheet.
