---
'@rsvelte/compiler': patch
---

Treat a component's `let:` variable as out of scope inside that component's named slots, the way upstream's scope chain does.
