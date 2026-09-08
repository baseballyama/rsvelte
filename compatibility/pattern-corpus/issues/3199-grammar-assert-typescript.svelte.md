# `3199-grammar-assert-typescript.svelte`

**Issue:** [#3199](https://github.com/baseballyama/rsvelte/issues/3199)

The same `assert` clause under `lang="ts"`, where official **accepts** it — acorn-typescript keeps the deprecated spelling. This is the file that makes the restriction JS-only; without it the fix is an over-rejection of every TS file that still writes `assert`
