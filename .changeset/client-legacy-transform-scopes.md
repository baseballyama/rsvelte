---
'@rsvelte/compiler': patch
---

Two client-side scope defects. A `style:` directive's value now reaches
`build_expression` with the metadata phase 2 filled in for the ExpressionTag rather
than for the directive, so a call in a style directive keeps its legacy
`($.deep_read_state(dep), $.untrack(() => value))` wrapper instead of being emitted
bare. And a `const` declared in a `try` or `finally` body inside a template
expression now shadows an outer reactive `let`: those two bodies were walked with
the outer scope, so every read was lowered as a signal read and the generated code
passed the component's state where the source passes the local.
