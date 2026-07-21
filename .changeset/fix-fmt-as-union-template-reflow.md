---
"@rsvelte/fmt": patch
---

fix(formatter): keep a template-position `as`/`satisfies` union flat when it fits

In an attribute value or mustache, `x as A | B` was expanded to a leading-`|`
multi-line union whenever the annotation broke onto its own line, while the
oxfmt(`svelte:true`) oracle keeps it flat (`… as\n  A | B`). oxc ties the
union's leading-`|` separator into the same group as the annotation break, so
once the annotation breaks the union always expands — no print width reaches
the oracle's layout. The oracle formats template expressions with prettier's
estree printer, whose `as`/`satisfies` layout breaks after the operator but
measures the union's own group independently.

`format_expr_core` now reproduces that layout for template expressions only: an
`oxc_ast_visit` gate confirms the formatted program contains an `as`/`satisfies`
node with a ≥2-member union, then each broken union block (a line ending in the
operator token directly followed by same-indent `| ` member lines) is collapsed
back onto the annotation line when the flat form fits the budget. Blocks with a
multi-line member, or whose flat form overflows, stay expanded — matching the
oracle. `<script>` blocks are untouched (they format through `format_program`
and already agree with the oracle on oxc's leading-`|`). The eventual upstream
fix remains a separate-group `as` layout in `oxc_formatter`.
