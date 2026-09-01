---
'@rsvelte/compiler': patch
---

Print a JSDoc cast around a private class-field read where official does. Upstream wraps the field node, so a comment leading it lands inside the generated `$.get(...)`; rsvelte spliced the wrap at the field's own offset and left the comment outside, where esrap's `ReturnStatement` rule then parenthesised the whole statement. The wrap now starts at the leading comment run, and at the parenthesised group when the source spells the cast `/** @type {T} */ (this.#x)` — acorn elides those parens while oxc keeps them as a node, so the comment leads the group rather than the field.
