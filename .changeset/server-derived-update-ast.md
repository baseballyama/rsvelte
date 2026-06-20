---
"@rsvelte/compiler": patch
---

Phase-3 server: lower derived **update expressions** (`count++` / `--count` →
`$.update_derived(count)` / `$.update_derived_pre(count)`, Svelte 5.53.2 upstream
`6aa7b9c64`) structurally in the AST read-wrapping pass
(`derived_reads_ast::visit_update_expression`), over the original valid script,
instead of the textual `rewrite_derived_update_expressions` scan. That scan ran
on the post-wrap intermediate `count()++` — not valid JS (a call is not an
assignment target), so it could never be re-parsed — and now survives only on
the byte-scanner fallback path, where it keeps the two paths byte-identical. Part
of the staged Phase-3 text → AST migration (`docs/phase3-ast-refactor-plan.md`).
Output is unchanged (byte-identical; corpus baseline holds at 120).
