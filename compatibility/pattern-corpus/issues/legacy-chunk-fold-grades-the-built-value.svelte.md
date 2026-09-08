# `legacy-chunk-fold-grades-the-built-value.svelte`

**Issue:** corpus residue

In legacy mode `build_expression` wraps a member/call/assignment chunk in `(deps…, $.untrack(…))`, and `scope.evaluate` has no `SequenceExpression` case — so the chunk is graded on the value it built, not on how constant its source reads. The comment-free `{flag ? 'lit' : 'lit'}` is the control that still folds.
