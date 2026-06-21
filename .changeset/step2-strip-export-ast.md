---
"@rsvelte/compiler": patch
---

Phase-3 Step 2 (script transform → AST): migrate the server
`strip_export_from_declarations` pass from a line scanner to an AST-driven-edit
pass (`server/strip_export_ast.rs`, mirroring the `derived_reads_ast` pattern):
it visits `ExportNamedDeclaration`s whose declaration is a function/class/`const`
and strips the exact 7-byte `export ` prefix structurally. The line scanner remains
as the parse-failure fallback. Byte-identical: corpus 120 no-NEW, byte-exact
runtime 19/19 + compiler_fixtures 17/17, plus 11 new unit tests.
