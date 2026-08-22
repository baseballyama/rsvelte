---
'@rsvelte/compiler': patch
---

Resolve names declared inside a `$:` statement through the statement's own scope chain, so a `catch` parameter, a block `let`, a `for` head, a `switch` case, and a `function`/`class` declaration no longer read as the instance binding that shares their spelling — in the cycle graph, in the client dependency thunk, and in the server's topological reorder
