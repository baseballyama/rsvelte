---
"@rsvelte/compiler": patch
---

Client destructuring *assignments* now expand nested patterns like the official compiler. `({ a: { b } } = src)` used to expand one level and leave the sub-pattern as another assignment, which the same transform then rewrote into a second `(($$value) => …)($$value.a)` IIFE; the expansion is now a port of upstream's recursive `extract_paths`, so every leaf is one flat assignment from its whole path (`$.set(b, $$value.a.b)`), a nested rest subtracts only its own level's keys, a default on a nested pattern becomes the base that sub-pattern reads from, and every array pattern — at any depth — contributes an `$$array` helper emitted before the assignments that read it. The surrounding shape follows the same upstream rule: the IIFE exists only when there is a helper or the right-hand side needs caching, and an uncached identifier right-hand side stays the IIFE parameter instead of being re-cached in `$$value`.
