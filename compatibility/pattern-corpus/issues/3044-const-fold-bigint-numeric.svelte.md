# `3044-const-fold-bigint-numeric.svelte`

**Issue:** [#3044](https://github.com/baseballyama/rsvelte/issues/3044)

Constant-folding gaps: `typeof` of a bigint const folds to `"bigint"`, numeric literals with separators/bases (`0b1010_1010`, `0o777`) fold, `1e-7` renders in JS spelling (`1e-7`, not `0.0000001`), and a `<svelte:head><title>` whose chunks all fold becomes a static string — a template-expression `1n` also used to become a phantom `unknown` identifier (an unparseable-at-runtime output)
