---
'@rsvelte/compiler': patch
---

A JSDoc comment before a parenthesised prop default no longer makes it a lazy thunk.

`is_simple_expression_str` decides whether a prop default is emitted as a value or as
`() => value`, and its call test — "ends in `)` and something precedes the matching `(`" — read a
leading comment as the callee. Neither axis reproduces it alone: the comment without parentheses
does not end in `)`, and the parentheses without a comment have nothing before the `(`.
