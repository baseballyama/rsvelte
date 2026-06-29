---
"@rsvelte/fmt": patch
---

fix(fmt): wrap a top-level assignment value in parens in every position

prettier-plugin-svelte always wraps a root-level assignment expression in exactly
one paren pair in expression position — `{x = 5}` → `{(x = 5)}`, attribute
`class={x = 5}` → `class={(x = 5)}`, block header `{#if a = 0}` → `{#if (a = 0)}` —
whereas OXC strips the parens at statement position. The block-header path already
re-added them, but mustache and attribute values did not, so a value like
`{(dataAttribute.value = [])}` lost its parens.

`format_expr_core` now applies the same canonical one-pair rule to a top-level
`AssignmentExpression` that it already applied to a `SequenceExpression`, covering
all three positions uniformly; the now-redundant block-header-specific re-wrap
(`block_header_expr_needs_parens`) is removed.
