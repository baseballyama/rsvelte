---
'@rsvelte/compiler': patch
---

A `<script module>` reassignment resolves its value through the binding's initializer, so a module local initialised to `undefined` or a primitive is no longer proxied
