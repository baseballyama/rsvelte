---
"@rsvelte/compiler": patch
---

Fix a server (SSR) codegen bug where two SEPARATE array-pattern destructuring declarations in one script (e.g. `let [a, b] = $state([1, 2]); let [c, d] = $state([3, 4]);`) both emitted a colliding `$$array = $.to_array(...)` temp. The `$$array` counter is now component-wide instead of being reset per declaration, so it deconflicts to `$$array`, `$$array_1`, … like the official compiler's `scope.generate('$$array')`.
