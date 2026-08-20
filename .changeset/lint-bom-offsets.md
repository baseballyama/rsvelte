---
"@rsvelte/lint": patch
---

Strip a leading UTF-8 BOM before linting, so a parse offset and the source text agree. The compiler's parser strips it (as upstream and as ESLint's `SourceCode` do) and therefore reports offsets relative to the stripped text, while the linter kept the unstripped source for its line table and its rule slices: every column on the BOM's line came out three short, and the JS-whitespace scan panicked slicing at byte 1, inside the BOM.
