---
"@rsvelte/compiler": patch
---

Stop judging a `SequenceExpression` defined by its last element when deciding the `?? ''` guard on a concatenated interpolation. Upstream's `scope.evaluate` has no `SequenceExpression` case at all — it falls to `default` and adds UNKNOWN — so a sequence is never `is_defined`, whatever the last element is. `{#each arr as q}{(n, s)}{q}{/each}` emitted `` `${(n, s)}${$.get(q) ?? ''}` ``, so a sequence evaluating to `null`/`undefined` rendered the string `"undefined"` where official renders nothing.
