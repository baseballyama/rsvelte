---
'@rsvelte/cli': patch
---

`rsvelte compile` of a TypeScript file keeps the parentheses TypeScript keeps. Those are the source's, except around a type assertion, plus the ones TypeScript adds at the start of a statement, an arrow body or a default export.
