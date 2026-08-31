---
"@rsvelte/language-server": patch
---

Mark unused and deprecated code in diagnostics: fill `DiagnosticTag` from the TypeScript code, which tsgo's LSP omits.
