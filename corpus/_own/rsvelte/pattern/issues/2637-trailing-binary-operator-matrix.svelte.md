# `2637-trailing-binary-operator-matrix.svelte`

**Issue:** [#2637](https://github.com/baseballyama/rsvelte/issues/2637)

The rest of the operator matrix behind `2605-trailing-binary-operator.svelte`: 15 of the 23 binary operators still cut the statement after #2605, including `*`, `<` (a prefix of the already-handled `<=`), `<<`, the word operators `in` / `instanceof`, and `,`. `-` and `/` remain excluded on purpose — `a--` ends a statement and `/` also closes a block comment — so the file does not use them
