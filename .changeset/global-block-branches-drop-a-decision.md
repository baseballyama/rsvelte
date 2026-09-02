---
'@rsvelte/compiler': patch
---

Three decisions inside a bare `:global { … }` block now answer the way upstream's
single `metadata.is_global_block` does. Under a descendant-position block
(`.x :global { … }`) an `animation` reference was hashed while its `@keyframes`
was not, so the emitted CSS named a keyframe nothing defines and the animation
silently did not run; a nested `:global(...)` kept its wrapper, because the
selector was returned as source text and so skipped `remove_global_pseudo_class`
along with the scoping modifier upstream really does skip; and `is_rule_empty`
had no counterpart for `is_empty`'s opening `children.length === 0`
short-circuit, so a global block whose only child is an empty rule was commented
out whole instead of having the verdict land on that child.
