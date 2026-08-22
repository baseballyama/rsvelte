---
'@rsvelte/compiler': patch
---

Report a missing semicolon at the token that could not continue the statement, the way acorn does, instead of at OXC's insertion point — the two are separated by whatever whitespace and comments lie between them, so the reported position and message now match the official compiler on every semicolon-free source
