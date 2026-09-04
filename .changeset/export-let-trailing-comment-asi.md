---
'@rsvelte/compiler': patch
---

A comment trailing a semicolon-free `export let` is no longer dropped from the generated `$.prop` call.

esrap flushes a same-line comment after a source declaration onto the initializer node, so once
that initializer becomes `$.prop(…)`'s last argument the comment prints inside the call. rsvelte's
port restored the comment only when the text before it ended in a `;` — and a declaration is
delimited by ASI as readily as by a semicolon, so `export let v = 1 // c` lost it.
