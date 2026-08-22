---
"@rsvelte/compiler": patch
---

Print the ES2022 brand check `#x in o` instead of replacing it with a comment.

ESTree has no `PrivateInExpression`: it models `#x in o` as a `BinaryExpression` whose `left` is a `PrivateIdentifier`, which esrap's `operand_needs_wrap` never parenthesizes. oxc gives the form its own node, so the port had no arm for it and fell to the printer's catch-all, which writes `/*unsupported:PrivateInExpression*/`. That marker was designed as a debugging aid for a test that forgot to check `printer.missing`, but `missing` has no production reader, so it reached the emitted JavaScript.

How loudly that failed was a property of the host, not of the defect: `return #x in o` and `String(#x in o)` produce text that parses and computes the wrong value, while `if (#x in o)`, a ternary test, a `&&` operand and a declarator initializer produce text no JS parser accepts. All three targets and `compileModule` were affected.

`ChainElement::PrivateFieldExpression` (`o?.#x`) reached the same catch-all and is printed now too.
