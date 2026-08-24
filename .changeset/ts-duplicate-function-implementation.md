---
'@rsvelte/compiler': patch
---

Reject a second `function` **implementation** with the same name. TypeScript lets a name carry any number of body-less overload signatures, and rsvelte turned that into "exempt every function-vs-function redeclaration", so `function f() {} function f() {}` compiled in a `lang="ts"` script — and in a plain one, where a function declaration always has a body. The exemption is now about the body rather than the `function` keyword, which also gives `declare function f(): void; function f() {}` the right answer, and the error carries acorn's code, wording and zero-width position
