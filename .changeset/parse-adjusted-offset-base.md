---
"@rsvelte/compiler": patch
---

fix(parse): the expression path's span base no longer underflows at offset 0

`parse_expression_with_typescript` wraps its content in parens, so absolute
positions are `offset + span - prefix`. Spelling that as a pre-subtracted
`usize` made the base itself negative whenever a caller starts at 0 — modular
arithmetic that comes out right in release and panics `attempt to subtract with
overflow` in debug. The `convert_ts_*` family now carries `AdjustedOffset`,
which keeps base and prefix apart and only ever hands out a sum.
