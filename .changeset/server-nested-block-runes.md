---
"@rsvelte/compiler": patch
---

Lower a `$state` / `$derived` declared anywhere below a server script statement, not only inside a function or arrow body. A bare block, an `if` branch, a loop body, a `switch` case with or without braces, a `try`/`catch`/`finally`, a `class` static block and a `for` head all left the rune call in the output, so SSR threw `ReferenceError: $state is not defined`. Labelled statements are now skipped at every depth, matching upstream's `LabeledStatement` visitor, which returns without descending in runes mode — previously a label inside a function body was lowered when it should not have been.
