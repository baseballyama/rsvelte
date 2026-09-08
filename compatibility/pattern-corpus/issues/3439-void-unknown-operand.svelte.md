# `3439-void-unknown-operand.svelte`

**Issue:** [#3439](https://github.com/baseballyama/rsvelte/issues/3439)

`void` has the single known value `undefined` even when its operand is unknown, while operand-dependent unary expressions remain reactive. The fold decides what a chunk contributes, never whether the element takes the `textContent` shortcut: upstream reads `metadata.expression.has_state`, which `Identifier.js` sets per identifier, so `<em>x{void p}</em>` over a prop keeps its text-node placeholder even though the chunk folds to `x`.
