---
"@rsvelte/compiler": patch
---

Stop a block comment from suppressing constant folding of the declaration below it (server).

`join_continuation_lines` decides whether a physical line continues onto the
next by reading the last non-whitespace byte it has emitted. Comment text went
into that same buffer, and a block comment ends in `/` — a division operator —
so a `/* … */` on its own line joined the next line onto itself. A joined
`const` declaration no longer starts with `const`, so `extract_constant_vars`
stopped seeing it and the template read was emitted as a runtime
`$.escape(...)` where upstream folds the literal in.

The continuation decision now looks past comment text to the last byte that was
actually code.
