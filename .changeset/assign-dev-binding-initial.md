---
"@rsvelte/compiler": patch
---

fix(client): a dev `$.assign` wrap follows the right-hand side's binding initializer

Upstream's `scope.evaluate` resolves an identifier through `binding.initial` when
the binding is neither a prop nor ever updated (`scope.js:303`), so
`const gray = Math.round(x); a[i] = a[j] = gray;` folds to a primitive and takes
no dev wrap. Both of rsvelte's ports answered `id.name == "undefined"` and
wrapped everything else.

Both halves of upstream's guard have to be read off phase 2's view of the
original script. `updated` is a getter over `mutated || reassigned`, which phase 2
keeps as two fields; and the settled text has turned every write into a call, so
oxc scores the name's only occurrence a read. The value comes from the original
source too — `binding.initial` carries a payload for a literal alone, so
`initial_span` is now populated on the three declarator branches outside the prop
block, which is where all three of its existing writers sit, and the two ports
share one predicate over the re-parsed slice.

The same predicate loses its `SequenceExpression` arm, which upstream's
`scope.evaluate` does not have: `o.a = (1, 2)` was already skipping its wrap on
`main`, and making the predicate reachable from an initializer would have added
`const g = (1, 2)` to it. HOST is the axis the fix turns on — an assignment in a
`<script>` function and one in a template-inline arrow reach two different ports,
and both had the gap.
