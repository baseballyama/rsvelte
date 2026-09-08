# `3194-strict-annex-b-function.svelte`

**Issue:** [#3194](https://github.com/baseballyama/rsvelte/issues/3194)

`if (true) function g() {}` — an Annex B labelled/nested function declaration, whose message is the generic `Unexpected token` and so cannot be told from an ordinary syntax error by the code alone
