---
"@rsvelte/compiler": patch
---

Stop emitting the `$.set(…, true)` proxy flag for a `BinaryExpression` value

`runs = runs + 1` on a `$state` binding produced `$.set(runs, $.get(runs) + 1, true)`
because the proxy sniff only saw the leading `$.get(` call. Upstream's `should_proxy()`
returns `false` for a `BinaryExpression` outright, so the flag is now suppressed for any
top-level arithmetic, equality, relational, bitwise, shift, `in` or `instanceof` operator.
`ConditionalExpression` and `LogicalExpression` bind looser and keep proxying.
