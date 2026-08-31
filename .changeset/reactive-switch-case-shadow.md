---
'@rsvelte/compiler': patch
---

Treat a `let` declared in a `switch` case as shadowing the outer binding when collecting a legacy `$:` statement's dependencies, so reactive statements are no longer reordered around it
