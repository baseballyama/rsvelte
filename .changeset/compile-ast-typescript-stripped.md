---
'@rsvelte/compiler': patch
---

`compile()`'s `ast` no longer carries TypeScript type annotations. Upstream's
`remove_typescript_nodes` deletes `typeAnnotation` and the TS `optional` marker
from every node it visits, and `result.ast` is serialized from that stripped
tree; rsvelte kept both on `Identifier`, `ObjectPattern` and `ArrayPattern`,
where nothing but the serializer reads them. The public `parse()` AST is
unaffected — it never runs the strip, and upstream keeps the annotations there.
