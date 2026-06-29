---
"@rsvelte/compiler": patch
---

fix(compiler): scope-aware prop reads in non-assignment reactive statements + parenthesize arrow operands of logical expressions

Two codegen bugs that made `layerchart/.../Highlight.svelte` emit invalid JS:

1. **Destructuring shadow in a reactive statement.** A `$:` body that is not a
   simple assignment (e.g. `$: if (cond) { items.map((p) => { const [x, y] =
   f(p); … }) }`) was routed through the scope-unaware text prop-read transform,
   wrapping the destructuring binding targets that shadow props `x`/`y` →
   `const [x(), y()] = …` (a syntax error). It now goes through the AST wrapper
   (`wrap_prop_source_reads_ast`), which uses OXC semantics to skip locally
   shadowed names. `wrap_prop_source_reads_ast` now also returns the source
   unchanged when parsing succeeds but nothing needs wrapping (previously it
   returned `None`, which fell back to the text path and re-introduced the bug).

2. **Arrow operand of a logical expression.** The text printer didn't
   parenthesize an arrow / `yield` operand of `&&`/`||`/`??`, so
   `onclick={onareaclick && ((e) => …)}` printed as `onareaclick() && (e) => …`
   (mis-parses, since arrows bind lower than `&&`). `logical_operand_needs_parens`
   now wraps `Arrow`/`Yield` operands.

Clears `Highlight.svelte`, zero corpus regressions.
