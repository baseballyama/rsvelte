---
'@rsvelte/compiler': patch
---

A comment trailing a `$state(...)` declaration is emitted inside the call the
declaration lowers to, the way upstream places it. Once the wrapper call is
synthesized there is no node left for the comment to trail, so upstream's
printer flushes it before the call's `)`; rsvelte closed the call first and left
the comment after the statement's `;`. Two stages were wrong: the declarator
rewrite only collected comments between the argument and the closing paren, so
one past the `)` (or past the `;`) was never a candidate; and the printer's
call-argument layout treated a comment *inside* the first argument as a reason to
wrap the enclosing call one-argument-per-line, which broke `$.tag($.state(…), 'x')`
across lines in dev where upstream keeps it on one. A comment genuinely between
two arguments, and a structurally multiline first argument, still wrap as before.
