---
"@rsvelte/compiler": patch
---

Close a rune field's `$.derived(…)` on a new line when its argument ends in a `//` comment

The server class-field path splices the `$derived(…)` argument verbatim and then appends the
closing paren. `value.trim()` removes the newline that ended a trailing `//` comment, so the
paren landed inside the comment and the call was never closed — the emitted module stopped
being JavaScript.

An object-literal argument is worse, because it takes a wrapping-paren branch and loses two.

The variant carrying a delimiter (`// ) c`) already worked: it bails to the AST path, which
relocates the comment. It is the *plain* comment that was unguarded here.
