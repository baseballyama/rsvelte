---
"@rsvelte/vite-plugin-svelte-native": patch
"@rsvelte/compiler": patch
---

fix(parse): give `switch` discriminants and assignment-pattern defaults exact identifier spans (#916). In program/script context the statement converter routed a `switch (X)` discriminant, a `case X:` test, a `do … while (X)` test, and the default value of a destructuring `AssignmentPattern` through `convert_expression` (which subtracts the synthetic-paren offset) instead of `convert_expression_for_program`. That shifted those spans one code unit to the left — `switch (x)` spanned the `x` as `(`, and the `$bindable` callee in `let { open = $bindable(false) }` spanned as ` $bindabl` — so span-based edits (`magic-string`, svelte-shaker) corrupted the source. All four now use the program-context converter, so every identifier satisfies `source.slice(start, end) === name`.
