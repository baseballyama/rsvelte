# `store-read-comment-text.svelte`

**Issue:** corpus residue

A store-subscription spelling inside a line comment remains comment text while the same `$store.member` expression in code is lowered to `$store().member`. String and regex bodies were already opaque to the client read scanner; comments must be excluded by the same source-range rule.
