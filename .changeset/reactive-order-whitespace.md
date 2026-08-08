---
"@rsvelte/compiler": patch
---

Order legacy `$:` statements from the AST, not from a whitespace-sensitive text scan.

`$: {mid=seed*2}` and `$: { mid = seed * 2 }` are the same program, but they
compiled to different execution order. The topological sort that orders reactive
statements was fed by a text scan that recognised an assignment only through the
literal `" = "` — spaces included — so the unspaced form was credited with
assigning nothing, never got an ordering edge, and ran before the statement whose
value it produces. Anything reading `mid` then saw a stale value on first run.
Every compound operator was affected too, not just `=`.

The sort now reads the assignment and dependency sets from the typed-AST walk
Phase 2 already performs for reactive-cycle detection, which cannot be fooled by
spacing, by an assignment inside a comment, or by one inside a nested function
body. That walk's result was previously discarded after the cycle check.

Removing the scan also deletes the per-reactive-variable re-scan it performed —
roughly `2 x` the number of reactive variables in scope, per `$:` statement — and
with it the identifier-matching helper stack that had no other caller.
