---
"@rsvelte/compiler": patch
---

Fix over-pruning of nested `&` sibling-combinator rules when an intermediate nesting level has a shape (a comma-separated selector list, a bare `:is()`/`:where()`, or a sibling combinator) that the ancestor-chain builder could not evaluate on its own. Previously a single unevaluable intermediate level made the whole ancestor chain bail to `None`, so a nested `&`'s sibling-combinator prune check (e.g. `& + &`) fell back to the empty compound matcher and the entire rule was pruned even when the ancestor constraint was actually satisfiable. The chain builder now resolves each level per branch — OR-ing across comma alternatives and expanding `:is()`/`:where()`, and verifying sibling combinators against the real sibling relationship — mirroring the official compiler's per-branch `NestingSelector` resolution, so only genuinely unsatisfiable rules are pruned.
