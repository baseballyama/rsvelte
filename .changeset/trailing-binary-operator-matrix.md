---
'@rsvelte/compiler': patch
---

Keep the operand after the rest of the line-ending binary operators in a legacy instance script. Only 8 of the 23 binary operators continued the statement, so `$: kind =\n\titem.a *\n\titem.b;` emitted `$.set(kind, item().a *)` — output no JavaScript parser accepts. `*` `%` `<` `>` `|` `&` `^` `**` `<<` `>>` `,` `in` `instanceof` now continue it too; `in` and `instanceof` only on a word boundary, so the identifier `margin` at a line end does not swallow the next line. `-` and `/` stay excluded: `a--` ends a statement and `/` also closes a block comment, so neither can be decided by suffix matching.
