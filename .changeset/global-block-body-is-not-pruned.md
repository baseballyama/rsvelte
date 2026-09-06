---
'@rsvelte/compiler': patch
---

A global block's body no longer scopes elements

Upstream's prune visits a global block's prelude and not its body, so a `.p`
prefix still scopes what it matches and nothing written inside the block scopes
anything. rsvelte read that decision off `metadata.is_global_block`, a key read
once and written nowhere, so the short-circuit was unreachable: the body was
walked like any other nested rule and a `&` in the subject matched every
element, giving `.p :global { &.a { … } }` a scope class on every descendant.
