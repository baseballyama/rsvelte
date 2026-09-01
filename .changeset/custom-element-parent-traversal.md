---
'@rsvelte/compiler': patch
---

An attribute-free custom element no longer makes its ancestor elements dynamic,
so the generated component stops emitting `$.child` / `$.sibling` / `$.reset`
traversal that the official compiler omits entirely
