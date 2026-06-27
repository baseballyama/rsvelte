---
"@rsvelte/compiler": patch
---

fix(transform): collect a spread argument as a reactive dependency

The legacy reactive-reference fallback walker treated a `SpreadElement`
(`[...x]`, `f(...x)`) as a terminal node, so the spread's argument was never
walked and its dependency dropped from the memo/effect (e.g.
`sum([...data.data], …)` lost `data`). It now recurses into the spread argument.
