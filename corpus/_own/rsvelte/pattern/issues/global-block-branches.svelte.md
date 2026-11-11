# `global-block-branches.svelte`

**Issue:** corpus residue

Upstream answers "is this rule a global block" with one predicate — `metadata.is_global_block`, set for a bare `:global` first in ANY compound — and rsvelte splits it across four predicates that no two of agree, so three separate decisions read a narrower one. Under `.x :global { … }` an `animation` reference was hashed while its `@keyframes` was not (output naming a keyframe nothing defines), a nested `:global(...)` kept its wrapper because the selector was returned verbatim, and `is_rule_empty` had no counterpart for `is_empty`'s opening `children.length === 0` short-circuit. The lone `:global { … }` block at the end is the control for all three: that position already answered correctly, which is why only the descendant one diverged. `.b[data-t=":global(z)"]` is the decoy that separates unwrapping by selector node from unwrapping by the text `:global(`, and the `:global(i)` beside it stops that row passing on a no-op.
