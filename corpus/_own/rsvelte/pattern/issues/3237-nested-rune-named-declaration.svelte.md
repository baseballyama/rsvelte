# `3237-nested-rune-named-declaration.svelte`

**Issue:** [#3237](https://github.com/baseballyama/rsvelte/issues/3237)

A `const` / `let` / `class` named after a rune, **declared inside a nested block**. #3527 stopped a `catch` parameter and a label from reading as a rune reference; a block-scoped declaration is the third slot of that shape, and it was still counted — which flipped the component into runes mode, where the runes-only `validate_identifier_name` then rejected the very declaration that caused it. Deliberately carries **no `$rune(` call**: every phase-3 rune lowering keys on that byte sequence, so a file without it isolates the mode decision from the lowerings a mode change re-enables. Upstream's `Scope.declare` exempts a nested declaration by `function_depth <= 1`, so the SAME declaration at the script's top level is rejected by both compilers and is not a repro
