# `g1-title-nullish-guard-both-directions.svelte`

**Issue:** corpus residue

One `scope.evaluate(value).is_defined` decision, read at three sites upstream, carried in one file in both directions: a `<title>` whose built value is a legacy `$.untrack(...)` sequence keeps `?? ''` even though the source expression is statically defined, and a function binding or a never-written `$state` binding does not. Scoring the source expression closes one direction; a hand-written table of binding shapes closes the other, and neither closes both.
