---
"@rsvelte/compiler": patch
---

Reject `modernAst: true` at the N-API boundary until rsvelte can return the
modern compiler AST, instead of silently accepting an option with no effect.
