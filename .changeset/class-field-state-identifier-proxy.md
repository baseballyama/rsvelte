---
'@rsvelte/compiler': patch
---

A class field's `$state` initializer resolves an identifier through its binding, as upstream's
`should_proxy` does, instead of wrapping every one in `$.proxy`
