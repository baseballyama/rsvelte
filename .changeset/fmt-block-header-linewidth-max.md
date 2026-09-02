---
"@rsvelte/fmt": patch
---

A block header wider than 320 columns is rejoined onto one line. `format_inline_expression` prints at oxc's `LineWidth::MAX`, so an expression past that breaks whatever width the caller asks for, and the rejoin that follows had no arm for an operator chain — a `{:else if}` of 338 columns came out across five lines where the oracle keeps one.
