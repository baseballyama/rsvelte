---
"@rsvelte/lint": patch
---

Apply `--fix` edits to the BOM-stripped source. The rules report offsets relative to the stripped text (as the parser and ESLint's `SourceCode` do) while the fixer spliced the unstripped source, so every edit in a BOM-prefixed file landed three bytes early — producing text such as `<scriptconstlet b = 2;`. The BOM is restored in the output, as `eslint --fix` does.
