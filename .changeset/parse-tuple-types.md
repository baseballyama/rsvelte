---
"@rsvelte/compiler": patch
---

Serialize TypeScript tuple types (`TSTupleType`, `TSNamedTupleMember`, `TSOptionalType`, `TSRestType`) as real nodes instead of a `TSUnknownKeyword` stub, so a comment inside one attaches to the member that carries it.
