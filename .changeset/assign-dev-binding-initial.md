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
`initial_span` is now populated on the three declarator branches that lacked it
and the two ports share one predicate over the re-parsed slice.
