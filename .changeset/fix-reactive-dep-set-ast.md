---
"@rsvelte/compiler": patch
---

fix(transform): build legacy `$:` dependency thunks from the Phase-2 AST reference set

The deps thunk of a `$.legacy_pre_effect` was previously built by text-scanning
the `$:` body (`find_pos` for order; `body_references_identifier` /
`is_only_assignment_target` / `is_in_lhs_only` for membership). That mis-handled
chained member-property keys (`l.add('x', e).add(add)` matched `add` from the
`.add(` method key, not the `add` argument), string-literal text, block
mutations, and shadowed params — producing wrong-order, wrong, extra, or missing
dependencies.

A new Phase-2 pass (`collect_reactive_statement_dependencies`) now records each
top-level reactive statement's ordered dependency identifier set by walking the
AST exactly like upstream `2-analyze/visitors/LabeledStatement.js` (order =
first-appearance traversal order; a name is a dependency unless its only
references are the outermost member-chain LHS of an `=`; member-property keys,
object keys, function params and block-locals are never references). The Phase-3
client deps thunk is emitted from that list. The block-ordering path
(`extract_reactive_statement_deps` / `sort_reactive_statements`) is untouched.
