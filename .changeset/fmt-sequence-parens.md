---
"@rsvelte/fmt": patch
---

fix(fmt): keep the outer parentheses of a top-level sequence (comma) expression in a mustache, matching prettier-plugin-svelte. `oxc_formatter` intentionally re-adds the outer parens of a top-level `SequenceExpression` (its `NeedsParentheses` impl returns true for an `ExpressionStatement` parent), and prettier-plugin-svelte keeps them — but `format_expr_core` then unconditionally ran `strip_outer_parens`, peeling the parens oxc had just added. So `{((ref = cond ? a : undefined), '')}` was emitted as `{(ref = cond ? a : undefined), ''}`. The strip is now skipped when the parsed top-level expression is a `SequenceExpression`; every other expression keeps the existing redundant-paren strip (`{(a + 1)}` → `{a + 1}` is unchanged). Because the fix lives in the shared `format_expr_core`, it also covers sequences in attribute values, directives, and block headers. Closes #799.
