---
"@rsvelte/compiler": patch
---

Emit a declarator's leading comment above the keyword, not between them.

Splitting `let a = 1,` / `// c` / `b = 2;` into one statement per declarator
produced `let // c` on one line and `b = 2;` on the next. That is valid JS and
it is the shape upstream prints, but every later pass in the text pipeline
matches `let <name>` on a single line, so all of them missed the declaration
and read `b = 2` as an assignment instead: a re-exported prop came out as
`labelId("")` and a legacy state variable as `$.set(b, 2)` with `b` never
declared.

The comment now goes on its own line above the keyword, so the declaration is
`let b = 2;` again. Only a comment that owns its line moves; one sharing a line
with code stays where it is.
