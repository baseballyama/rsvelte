---
"@rsvelte/compiler": patch
---

Align constant folding with upstream `scope.evaluate` in both directions

Two reports were the same disagreement seen from opposite sides.

Folding too little: a template literal whose interpolations are all constants was
not folded on any target, because the fold accepted a backtick literal only when it
contained no `${` and the client evaluator had no template-literal case at all.
Upstream walks the quasis and folds as soon as every interpolation is known, so
`` const cont = `p${'ab'}q` `` now reaches `p.textContent = 'pabq'` /
`` $$renderer.push(`<p>pabq</p>`) ``. `null` and `undefined` interpolate as their
names, a `Math.PI`-style global constant now folds, and the server no longer stops
at "this is a string" for a template-literal initializer.

Folding too much: a member read on a literal — `{[1, 2].length}`,
`{(async (p = 1) => p).name}` — was treated as static, so the element was emitted as
`<p></p>` and the dynamic text node the runtime expects to fill had no placeholder.
Upstream's rule is `has_state ||= !is_pure(node)`, and `is_pure` walks to the
leftmost object: an array, object or function literal there is impure. A string
literal there is pure, so `{'ab'.length}` correctly stays static — the neighbours
are not all on the same side.

Also fixes a member read printed with a literal object losing upstream's
parentheses (`'ab'.length` where esrap writes `('ab').length`): only the two plain
literal variants were wrapped, not the raw-spelling, boolean, bigint, regex and
null ones.
