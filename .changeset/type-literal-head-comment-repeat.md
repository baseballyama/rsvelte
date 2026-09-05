---
'@rsvelte/compiler': patch
---

A comment erased with a TypeScript declaration is repeated exactly where upstream
repeats it. acorn-typescript decides what an opening token starts by parsing
ahead and rewinding, and `tsLookAhead` leaves `isLookahead` unset, so every
comment consumed before the decision point fires `onComment` twice: the `{` of a
type literal or a mapped type up to its first member, and the `(` of a function
type's parameter list or a parenthesized type up to what follows it. rsvelte
repeated "the first comment re-emitted anywhere in the script" instead, which
diverged in three directions at once — an `interface` member's comment was
repeated (an interface body is never parsed speculatively), a later member's
comment was repeated, and the head comment of a second speculative position in
the same script was not.
