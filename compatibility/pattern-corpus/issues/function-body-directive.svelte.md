# `function-body-directive.svelte`

**Issue:** corpus residue

A string-literal statement at the start of an arrow, function expression, or function declaration remains in the ESTree body and generated output. OXC separates these into `FunctionBody.directives`; every Phase 1 body conversion must prepend them to the ordinary statements instead of silently dropping them.
