---
'@rsvelte/compiler': patch
---

Four node kinds reach the public `parse()` AST instead of being dropped by a catch-all.

`TSImportEqualsDeclaration`, `TSExportAssignment` and `TSNamespaceExportDeclaration` fell
through `convert_statement_for_program`'s `_ => None`, and a class-body `TSIndexSignature`
fell through the two class-element converters' — so every consumer that reads rsvelte's AST
without compiling (`rsvelte_lint`, svelte2tsx, the language server, the playground) saw a
statement or a class member that is not there. Official's AST carries all four.

Each is carried as its complete ESTree object, the same representation the neighbouring TS
declarations already use, and the class-element converter that now names every `ClassElement`
variant has lost its catch-all: a new oxc variant is a build error rather than a silently
dropped node.

The stand-in a namespace body used for an `import x = require(…)` — a `DebuggerStatement`
with the right span, there only to keep the namespace non-type — is gone with it, so
`parse()` no longer reports a node the source does not contain.
