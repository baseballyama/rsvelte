---
'@rsvelte/compiler': patch
---

Decide the snippet module-scope hoist from references, not from an enumeration of expression kinds

Whether a top-level `{#snippet}` is hoisted to module scope was answered by a whitelist of
expression node kinds whose default arm was "not hoistable", so a snippet was pinned inside the
component function by any expression kind the list did not happen to name — not by anything it
referenced. `ChainExpression` was one such kind, which is why `{@render s?.()}` blocked the hoist
that `{@render s()}` permits, but so were a tagged template, a class expression and a TypeScript
`as`. Upstream reaches the same decision from the snippet scope's *references*, where an
expression kind is transparent; the unnamed kinds are now walked for identifiers the same way,
which is what the predicate's third copy (used for arrow-function bodies) already did — the same
`{mo?.a}` hoisted when it sat inside `onclick={() => …}` and not when it stood alone. A snippet
that references instance state is unaffected: 25 such rows were measured against the official
compiler before and after and none moved.
