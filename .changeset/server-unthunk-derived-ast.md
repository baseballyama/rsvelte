---
"@rsvelte/compiler": patch
---

Phase-3 server: collapse `$.derived(() => NAME())` → `$.derived(NAME)` (Svelte
5.55.5 upstream `b771df3`) structurally via a new AST pass
(`unthunk_derived_ast`), matching the `$.derived(...)` call with a single
parameterless expression-bodied arrow whose body is a 0-arg non-optional call of
a derived identifier. Replaces the literal-prefix byte scanner
`unthunk_bare_derived_arg`, which now serves only as the parse-failure fallback.
Part of the staged Phase-3 text → AST migration
(`docs/phase3-ast-refactor-plan.md`). Output is unchanged (byte-identical; corpus
baseline holds at 120).
