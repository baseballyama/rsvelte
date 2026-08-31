---
'@rsvelte/compiler': patch
---

Keep a named function expression's own identifier in the serialized program. Both
program converters set `id: null`, so the name was invisible to every consumer —
including the scope walk, which therefore never reserved it and generated a
colliding dev event-handler name.
