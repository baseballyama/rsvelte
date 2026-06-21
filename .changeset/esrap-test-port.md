---
"@rsvelte/compiler": patch
---

Harden the `rsvelte_esrap` printer (which prints the compiler's Phase-3 output)
against the upstream esrap `v2.2.11` test suite, now vendored as a submodule and
ported to Rust. The full esrap sample corpus is byte-identical (97/97) and every
esrap unit test (quotes, indent, compat, additional-comments, arrow-return-type,
sourcemap-keywords) is ported and passing. Printer behaviour was made faithful
to esrap: directives, `EmptyStatement`/`WithStatement`, import attributes,
comment threading through sequences/call-args/class-bodies, full TypeScript
type-syntax and JSX printing, precedence-based parenthesisation (unwrapping
explicit parens like esrap's acorn baseline), and string escaping (`\t` left
literal). Adds source-map generation (`print_with_map`) and synthetic-comment
hooks (`print_with_hooks`).
