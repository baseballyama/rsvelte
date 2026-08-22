---
"@rsvelte/compiler": patch
---

Stop a parenthesised nested class expression from turning its enclosing field into a rune field. `inner = new (class { deep = $state(1); })()` compiled to `#inner = $.state(1)` with an accessor pair — the class expression and the field's real initializer silently gone. The member splitter now scans inside a `(`/`[` region instead of jumping it, so a class body written there gets the same one-member-per-line shape, and a class field is recognised only when the rune is the head of its initializer, as upstream's `get_rune(value, scope)` requires.
