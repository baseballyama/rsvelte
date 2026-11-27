---
'@rsvelte/cli': patch
---

`rsvelte compile` of a TypeScript file writes the second dot after a number when only a byte order mark stands between the number and a property access, as TypeScript does.
