---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

`parse()` emits `TSDeclareFunction` instead of dropping the statement.

A function with no body — a `declare function`, or an overload signature — was filtered out
of the AST entirely. Upstream keeps it: acorn-typescript spells it `TSDeclareFunction`, with
no `body` key at all, `declare` stamped only where the keyword is written, and `returnType`
where one is annotated. `compile()` still erases it, the way upstream's
`TSDeclareFunction() { return b.empty; }` visitor does.

Dropping a statement is not one missing node. The AST comparison walks a body array index by
index, so every sibling after the hole pairs against the wrong node and reports divergences
that belong to neither.

`returnType` was never emitted on an ordinary `FunctionDeclaration` either; it is the same
field, so both are carried now. The binary parse envelope grew two fields, and its writer and
its decoder ship in one fixed group because a decoder that ships ahead of its writer reads the
wrong offsets.
