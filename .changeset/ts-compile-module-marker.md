---
'@rsvelte/cli': patch
---

`rsvelte compile` of a TypeScript file keeps a module one as TypeScript does. It writes `export {}` where every import and export was a type, and keeps an import or export of types only without its names.
