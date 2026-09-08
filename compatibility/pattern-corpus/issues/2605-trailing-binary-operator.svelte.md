# `2605-trailing-binary-operator.svelte`

**Issue:** [#2605](https://github.com/baseballyama/rsvelte/pull/2605)

A statement whose line ends with a binary operator and whose right operand is on the next line — `let flag = … ||` (read by the `$.mutable_source` initializer scanner) and `$: kind = … ===` (read by the instance-script line accumulator). Both closed the statement early and emitted `$.mutable_source(… ||)` / `$.set(kind, … ===)`, which is not JavaScript. The `width` / `height` declarations pin the other side: a statement that does not end in an operator still ends
