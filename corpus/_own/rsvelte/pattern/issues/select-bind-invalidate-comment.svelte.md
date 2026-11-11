# `select-bind-invalidate-comment.svelte`

**Issue:** corpus residue

`AssignmentExpression.js` appends `$.invalidate_inner_signals(() => { … })` to a mutation of a binding that backs a legacy `<select bind:value>` with indirect references, and `b.arrow([], b.block([…]))` gives that block no `loc` — so printing it parks esrap's comment cursor, the fourth kill `dead_comments` has to model. The `<option>{bar}</option>` child is what makes the binding indirect: without it no thunk is built and the same comment survives, which is what separates a kill keyed on the binding from one keyed on the mutation. The nested `// revived by this located body` pins the revive half.
