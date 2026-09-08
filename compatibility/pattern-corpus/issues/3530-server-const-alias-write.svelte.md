# `3530-server-const-alias-write.svelte`

**Issue:** [#3530](https://github.com/baseballyama/rsvelte/issues/3530)

The SSR constant-fold's second pass resolved `const alias = written` against `written`'s literal initializer, and the "this binding is written, drop it" removal ran afterwards — so the removal took `written` and left the value it had already leaked into `alias`. The server rendered the pre-write literal while the client was byte-identical to official throughout. Carries the alias, a second alias reading the first, and an arithmetic expression because all three go through that pass, plus an unwritten `const` in both spellings as the control that must still fold
