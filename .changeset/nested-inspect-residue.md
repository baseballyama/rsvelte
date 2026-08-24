---
'@rsvelte/compiler': patch
---

Give a removed `$inspect(…)` the residue the official compiler leaves no matter how deeply it is nested, and stop the client's non-dev removal from rewriting the same bytes inside a string literal or a comment.
