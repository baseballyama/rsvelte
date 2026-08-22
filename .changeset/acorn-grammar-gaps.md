---
'@rsvelte/compiler': patch
---

Reject the syntax OXC parses and acorn does not, so a component script is no longer accepted where the official compiler rejects it — `using` / `await using` declarations, the `import defer` / `import source` phases, and the withdrawn `assert { … }` spelling of an import-attributes clause on an import or a re-export. The `assert` restriction is JS-only, because acorn-typescript still accepts it
