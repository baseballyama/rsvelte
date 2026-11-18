# `title-memo-definedness.svelte`

**Issue:** corpus residue

A `<title>` template with two memoized calls keeps `?? ''` on both generated memo identifiers. Upstream tests definedness after `Memoizer.add` has replaced each call with a fresh `$N`; testing the original call instead incorrectly declares the result defined and changes the generated AST. The separate `title_call_only_memo` Rust test pins the single-expression branch.
