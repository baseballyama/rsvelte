# `import-specifier-comment-store-ref.svelte`

**Issue:** mutation ratchet

`enclosing_pattern_open` walks backwards over raw characters and gives up on `(`, `)` or `;`, so a comment between two import specifiers hides the enclosing `{` from every name after it: `is_dollar_ident_import_specifier` answers "not a specifier" and the `$`-reference collector records a store read that upstream does not. The specifier BEFORE the comment is unaffected — that asymmetry names the backward scan rather than the specifier rule. The output parses, so only output equality reports it, while `$.store_get` is called on a non-store import. Its sibling caller (`is_dollar_ident_destructuring_declaration`) was measured on the same shape and does NOT reproduce.
