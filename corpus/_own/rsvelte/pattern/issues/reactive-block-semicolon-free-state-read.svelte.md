# `reactive-block-semicolon-free-state-read.svelte`

**Issue:** corpus residue

`transform_state_reads_ast` tells an object literal from a statement block by scanning for a top-level `;`, so semicolon-free source (`standard` style) satisfies the object-literal test, the `(`…`)` it then adds makes the parse fail, and the whole state-read pass is skipped — the `legacy_pre_effect` dependency thunk still reads `$.get(w)` while the body reads the bare variable. The second `$:` block starts with an assignment and was always correct; it is the control that stops "never wrap" from passing.
