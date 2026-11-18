# `legacy-state-name-redeclared-inside-a-function.svelte`

**Issue:** shadow probe

`transform_legacy_state_declarations` finds `let <name> =` by text, and its caller hands it one top-level instance statement at a time — so the whole body of `function go() { let v = …; }` is one input and the LOCAL declaration was lowered to `$.mutable_source`, allocating a signal per call and reading it back through `$.get`. Upstream promotes only a top-level `let`, so the rewrite is now refused unless the match sits at the statement's own brace depth, measured with the comment- and string-aware `code_bytes` scanner. `tick()` writes the real state variable as the positive control; the class method is the second host, and `let w;` covers the no-initialiser pattern. This is the first shadow fix in this batch with a non-zero corpus reach: 3 of 34,728 entries move, and `musicat/src/lib/views/AlbumsView.svelte` goes from a listed failure to a 4-target match.
