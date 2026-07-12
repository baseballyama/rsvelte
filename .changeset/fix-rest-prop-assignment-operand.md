---
"@rsvelte/compiler": patch
---

fix(transform): keep a rest-prop `rest.X` that is a direct assignment operand

Upstream (`Identifier.js`) rewrites a rest-prop read `rest.opacity` to
`$$props.opacity` EXCEPT when the member is a direct operand of an
`AssignmentExpression`/`UpdateExpression` — including the RHS — where it stays
`rest.opacity`. So `ctx.globalAlpha *= rest.opacity` and
`img.crossOrigin = rest.crossOrigin` keep `rest.X`, while `if (rest.opacity != null)`
and `deps: [rest.opacity]` become `$$props.opacity`. The runes-mode instance
transform rewrote every `rest.X` unconditionally. It now leaves a direct
rest-member RHS verbatim; a compound-assign to a reactive identifier LHS (which
desugars the RHS into a `$.set(a, a() <op> rhs)` binary and IS optimized) is
already handled by the earlier state/prop-assignment branches. Clears layerchart
Group.canvas.svelte and Image.canvas.svelte.
