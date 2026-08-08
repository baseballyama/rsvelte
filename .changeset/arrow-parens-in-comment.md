---
"@rsvelte/compiler": patch
---

Stop the client instance-script scan from rewriting comment bodies.

`strip_unnecessary_arrow_body_parens` scanned the instance script for `=> (` and
dropped the parentheses. It skipped string and template literals but not
comments, so a comment whose text happened to contain an arrow function was
edited too:

```js
// values.forEach((v) => (valueFilter[v] = true));   // official
// values.forEach((v) => valueFilter[v] = true);     // rsvelte
```

Measured against the whole corpus with the pass removed, it changed output for
4 of 14,138 entries and diverged from official on all 4 — three become
byte-identical to official once it is gone, and the fourth loses the rewritten
comment above. Nothing regresses, because everywhere else esrap already prints
the parens the way official does; the pass only ever mattered on inputs where
its own text rewrite forced the fallback path. It is removed rather than fixed.

The corpus gate could not see this. A byte-different output falls back to an AST
comparison, and `ast_equiv_batch` applies `CommentPolicy::Ignore` unless
`--comments` is passed, so a divergence living entirely inside a comment scores
`match`. No ratchet listed these entries either.
