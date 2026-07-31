---
"@rsvelte/compiler": patch
---

fix(compiler): drive the TypeScript erasure pass from a generic AST visitor so type syntax can no longer survive in node kinds the hand-written walker forgot — tagged-template expressions, `import(…)`, destructuring assignment targets, `extends` expressions, computed class-member keys, `for` initializers, non-declaration `for…of` / `for…in` targets and `with` bodies
