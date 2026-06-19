---
"@rsvelte/compiler": patch
---

Phase-3 server: lower derived **assignments** (`count = x` → `count(x)`, compound
and logical operators expanding via `build_assignment_value` — `count += 1` →
`count(count() + 1)`, `flag &&= x` → `flag(flag() && x)`; upstream
`AssignmentExpression.js`) structurally in the AST read-wrapping pass
(`derived_reads_ast::visit_assignment_expression`), over the original valid
script, instead of the textual `rewrite_derived_assignments` scan. That scan ran
on the post-wrap intermediate `count() = x` — not valid JS (a call is not an
assignment target), so it could never be re-parsed — and now survives only on the
byte-scanner fallback path. Implemented as non-overlapping edits (skip the LHS
identifier, replace the `op=` gap, append `)`) so RHS read-wrapping and nested
`a = b = 1` resolve in the same pass. Follows the update-expression fold; part of
the staged Phase-3 text → AST migration (`docs/phase3-ast-refactor-plan.md`).
Output is unchanged (byte-identical; corpus baseline holds at 120).
