---
'@rsvelte/compiler': patch
---

Drop an `EmptyStatement` the source wrote from the client output, as esrap does, while keeping the one a removed non-dev `$inspect(…)` stands in for.
