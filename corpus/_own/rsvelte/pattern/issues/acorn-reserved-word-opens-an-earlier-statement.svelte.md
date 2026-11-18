# `acorn-reserved-word-opens-an-earlier-statement.svelte`

**Issue:** error-position probe

Both compilers reject this file, so the subject is the reported position, not the output. acorn raises `The keyword 'public' is reserved` while *reading* `public;` — a whole statement before `foo(;`, the one it cannot parse — while OXC settles the reserved word after parsing and, on a fatal parse error, hands back a `Program::dummy` with no AST to find the word in. So the position had to come from a source scan for reserved words that OPEN a statement, with acorn's `isLet()` rule and an `interface` exclusion. 63-cell grid: 32 → 59 parity, four independent ablations.
