# `prop-default-value-writes.svelte`

**Issue:** #4194

Upstream visits a prop's default value with the same `AssignmentExpression` / `UpdateExpression` visitors as any other expression. rsvelte reaches a default through passes that skip a line containing `$.prop(`, and only the READ halves had a default-scoped counterpart, so `() => ($store = 1)` emitted `() => ($store() = 1)` — text no JS parser accepts — while `() => (prop = 1)` dropped the invalidation. The state defaults are the control (their pipeline already reached a default), and the bare `$store` pins that an identifier default stays a getter reference. Written unparenthesised on purpose: the update rewriter parses its input as a PROGRAM, so `() => prop++` came back with a statement terminator inside the argument list, which a parenthesised grid cannot see.
