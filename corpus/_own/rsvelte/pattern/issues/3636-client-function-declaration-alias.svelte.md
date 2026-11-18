# `3636-client-function-declaration-alias.svelte`

**Issue:** [#3636](https://github.com/baseballyama/rsvelte/issues/3636)

A `const` alias of a function declaration remains a dynamic client text chunk in legacy mode: a function marker identifies the value's type but is not a compile-time-known concrete value. Direct arrow functions, plain const aliases and `typeof` a function declaration pin the neighbouring folds that remain static.
