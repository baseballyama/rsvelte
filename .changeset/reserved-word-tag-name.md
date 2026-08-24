---
"@rsvelte/compiler": patch
---

Client: an element whose tag name is a JS reserved word no longer emits a
declaration that cannot parse. `<var>x</var>` produced `var var = root();`, and
42 of 46 reserved words behaved the same way, `<var>` and SVG `<switch>` among
them. The name allocator now refuses a reserved word the way upstream's
`Scope.unique` does.
