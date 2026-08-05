---
"@rsvelte/compiler": patch
---

Client output now applies the read/store transforms inside `switch` statements
and class expressions. A `{#each}` item read used as a `switch` discriminant
(`switch (item.value)`), as a `case` test (`case item.value:`), as a class
expression field initializer (`class { f = item.value }`) or as a class
expression computed method key (`class { [item.value]() {} }`) was emitted
against the raw signal instead of `$.get(item)`, so the value was `undefined`
and no `case` ever matched — silently, in production builds as well as dev. The
recursive transform walk had no `switch` arm (the catch-all cloned the statement
verbatim) and listed class expressions among the terminal "nothing to transform"
nodes. Because that same walk marks the each-index binding as used and registers
store getters, the omission also dropped the `i` parameter from the `$.each`
callback and skipped the `$.store_get` getter whenever the binding was read only
from one of those positions, turning an undefined `$store` read into a
`ReferenceError`. Separately, the store-subscription pre-scan classified any
`$store` followed by `:` as an object property key, which misfired on
`case $store:`; a `case` test is now recognised as a value expression.
