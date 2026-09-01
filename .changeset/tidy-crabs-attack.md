---
'@rsvelte/compiler': patch
---

Print a JSDoc cast around a private class-field read where official does. Upstream wraps the field node, so a comment leading it lands inside the generated `$.get(...)`; rsvelte spliced the wrap at the field's own offset and left the comment outside, where esrap's `ReturnStatement` rule then parenthesised the whole statement. The wrap now starts at the leading comment run, and at the parenthesised group when the source spells the cast `/** @type {T} */ (this.#x)` — acorn elides those parens while oxc keeps them as a node, so the comment leads the group rather than the field.

Both AST read passes are reached for a bare class member now, not just one. A private field outside a class body is a parse error, so `private_read_wrap_ast` and its member-chain sibling were both falling through to a text scan; reviving only the first one made it claim the standalone reads while continuing to skip a member-chain object on the premise that the sibling took it — so `this.#x[i]` lost its `$.get(...)` in any class that also holds a standalone read of the same field.
