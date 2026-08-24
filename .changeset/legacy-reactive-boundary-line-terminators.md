---
'@rsvelte/compiler': patch
---

Fix the legacy `$:` boundary when a statement shares its line, and treat CR / U+2028 / U+2029 as line terminators

The client instance-script pipeline read one physical line as one statement, so a
`$:` sharing its line with another statement put the boundary in the wrong place —
splicing the next statement into the `$.set(...)` call (output no JS parser
accepts), swallowing it into the effect body, or dropping the `legacy_pre_effect`
wrapper and emitting a bare `$:` label. Top-level statement boundaries now come
from the parser.

The same "line" notion was `\n`-only in two places: that split, and the printer's
decision about whether a comment and the node after it share a line. A `//`
comment terminated by CR / U+2028 / U+2029 therefore absorbed the statement that
followed it, which disappeared from the output.
