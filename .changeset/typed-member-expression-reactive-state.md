---
"@rsvelte/compiler": patch
---

Answer member expressions in the reactive-state predicate from the typed AST

`expression_has_reactive_state` answered only a bare identifier and a literal off
the typed nodes; every other shape materialized the expression as a
`serde_json::Value` tree that was walked once and thrown away. Member
expressions alone were 70.3% of the remaining materializations.

The typed front end now mirrors every arm the JSON walk handles explicitly —
member, call, new, binary/logical, unary, conditional, template literal, chain,
sequence, assignment, object, array, await, update, spread and function
expressions — so those shapes are answered without building any JSON. Anything
that would reach the JSON walk's conservative "unknown node type" default (a
tagged template, a class expression, a TS wrapper) still falls back to it, so
the answer is unchanged for every input.
