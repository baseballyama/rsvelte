---
"@rsvelte/compiler": patch
---

Fold a value aliased from a `const` into the template, the way `scope.evaluate` does upstream: `const K = 1; let v = $state(K)` now renders `{v}` as static text instead of keeping the chunk reactive. The alias's initializer AST was never stored, so the existing recursion had nothing to follow.
