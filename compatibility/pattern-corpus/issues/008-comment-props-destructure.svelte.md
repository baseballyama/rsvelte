# `008-comment-props-destructure.svelte`

**Issue:** [debt 008](../../debt_list/008-mutation-gate-has-behavioral-code-mismatches.md)

A block comment between `=` and `$props()` in a read-only destructure. The AST-confirmed rune call must be lowered despite the trivia, not survive as a runtime reference to `$props`.
