---
"@rsvelte/lint": patch
"@rsvelte/compiler": patch
---

Align `rsvelte-lint` with `eslint-plugin-svelte` on the axes no gate previously compared.

- 21 rules defaulted to `warn` where upstream defaults to `error`. Severity decides the exit code in both tools, so `rsvelte-lint` exited 0 where `eslint` exits 1 on the same source. Three rule mode-gates likewise made rsvelte run a rule ESLint skips.
- The human-readable and GitHub Actions diagnostic writers printed a zero-based column — `4:0` where ESLint prints `4:1`. SARIF and the machine format were already correct.
- `--fix` resolved `eslint-disable` directives against the parser's line table while the report path used the reporting rule's own table, so a directive suppressed one line and the fixer rewrote another wherever U+2028/U+2029 make the two tables differ.
- `prefer-class-directive`'s autofix trimmed with Unicode `White_Space` semantics while its report used JS semantics, so a `class` value padded with U+FEFF was reported identically to ESLint and rewritten differently.
- The JSON API the wasm and NAPI bindings wrap reported every rule on the parser's line table, so the seven rules that upstream positions with `getLocFromIndex` came out on a different line and column there than from the CLI. All consumers now share one `LintDiagnostic::report_span`.
- `prefer-destructured-store-props` now gates its rune-named-store skip on runes mode, `infinite-reactive-loop` no longer treats an inline function expression as a then-callback, `no-trailing-spaces` no longer counts a leading BOM as trailing whitespace (its autofix would have deleted the BOM), and lint parse errors now carry a line and column instead of a debug-formatted struct.
