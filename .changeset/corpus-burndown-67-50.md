---
"@rsvelte/compiler": patch
---

Phase-3 corpus byte-parity burndown: known-failures `67 → 50`. Each fix is
independent and AST-precise, verified byte-identical against the official
compiler with zero corpus regressions:

- scope-aware `should_proxy` for private `$state` field assignments
- constructor nested-function private `$state` reads use `$.get(...)` not `.v`
- boundary-nested `{#snippet}` emitted inline (not hoisted to module scope)
- `Math.*` / `Number` / `String` / `BigInt` const initializers are `is_defined`
  (no spurious `?? ""`)
- `$.css_props` SVG-namespace flag reflects the rendering context
- store reads inside a spread (`...$store`) are wrapped
- no constant-fold of an identifier shadowed by an `{#each}` item
- a class-body-declared private field assigned a rune in the constructor keeps
  its source position
- nested-function private `$state` member mutation reads through the proxy
  (`$.get(this.#x).prop`)
- TS-typed declaration tag `{const x: number = …}` no longer dropped on the server
- invalid top-level reactive declaration `$:` in `<script module>` is dropped

Output for all other inputs is unchanged.
