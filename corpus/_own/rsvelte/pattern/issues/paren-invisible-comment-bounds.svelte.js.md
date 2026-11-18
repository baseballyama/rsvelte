# `paren-invisible-comment-bounds.svelte.js`

**Issue:** corpus residue

acorn elides parentheses, so a `(` is neither a node a comment can lead nor a bound for the flush that prints it, and oxc's `ParenthesizedExpression` made it both. The leading flush bounded at the `(` printed a JSDoc cast's comment on the operand's line where upstream breaks it; the dev `await` wrapper's comment run stopped at the same `(` and left the cast outside. The `g(` here is the control: the same byte, opening a node that starts at `g`, and it still stops the run.
