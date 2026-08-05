---
"@rsvelte/compiler": patch
---

fix(compiler): honour `svelte-ignore` comments inside object and array literals.
Phase 1 distributed script comments through a hand-maintained allowlist of
statement-body fields (`BlockStatement`, `SwitchStatement`, `VariableDeclaration`,
`ClassBody`, …), so a `// svelte-ignore` in front of an object-literal property,
an array element or a call argument bound to nothing and suppressed nothing —
producing warning noise the author had no way to silence. Comment attachment now
mirrors upstream `add_comments` (`phases/1-parse/acorn.js`): the walk is generic
and positional, a comment binds to the first node in pre-order that starts after
it, and that node's whole subtree inherits the ignore. Upstream's trailing-comment
rules are ported with it, so a comment after the last element of a block or literal,
or one separated from the previous node by only `,`/`)`/spaces, still belongs to
the node before it and does not over-suppress the node after it.
