---
"@rsvelte/compiler": patch
---

Server: a comment between a declaration keyword and the binding name of a rune-lowered declaration stays in that slot instead of moving ahead of the whole statement. The emitted declaration kept only the declarator's span, so the comment sorted before it.
