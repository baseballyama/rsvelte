---
"@rsvelte/compiler": patch
"@rsvelte/svelte2tsx": patch
"@rsvelte/svelte-check": patch
---

fix(svelte2tsx): remove a re-export (`export { x } from './mod'`) from a
component's instance script instead of leaving it inside the generated
`$$render()` body. Upstream `ExportedNames.handleExportDeclaration` keys off
`ts.isNamedExports(exportClause)` alone and never inspects `moduleSpecifier`,
so every named export clause — with or without a `from` — is stripped and
recorded as an export. rsvelte skipped the clause whenever a module specifier
was present, emitting an `export … from` inside a function body: invalid TSX
(TS1233) that made svelte-check discard *all* diagnostics for the file.
