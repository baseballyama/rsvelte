---
"@rsvelte/compiler": patch
---

Legacy (non-runes) destructuring *declarations* now expand nested patterns like the official compiler. `let { a: { b } } = obj` used to be left verbatim, so the nested state leaf never got its `$.mutable_source` wrapper (nor the dev `$.tag` label); the expansion is now a port of upstream's recursive `extract_paths`, so every leaf carries its full path (`tmp.a.b`), a nested `...rest` subtracts only its own level's keys, a default on a nested pattern becomes the base the sub-pattern reads from, and every array pattern — at any depth — gets its own `$$array` helper, emitted before the leaves that read it.
