---
'@rsvelte/cli': patch
---

`rsvelte compile` of a TypeScript file writes the second dot after a number where TypeScript does. That includes a byte order mark, a next line character or a zero width space before the dot.
