---
'@rsvelte/compiler': patch
---

fix(sourcemap): a binding's type annotation belongs to the binding's range

Upstream parses with acorn-typescript, whose `Identifier` range covers its own
type annotation, so esrap stamps the map at the annotation's end. rsvelte erases
the annotation from the script text before re-parsing with oxc, which puts the
annotation on the *owner* node, so the binding ended at its own last byte and
every map segment for an annotated binding pointed short.

`ScriptProjection` now carries `(binding end, annotation end)` for each erased
annotation and the printer's end lookup consumes it. Measured over the whole
corpus on both arms: 0 generated-code units moved, 3,199 client map units
improved, 0 worse, and 7,986 fewer wrong segments.
