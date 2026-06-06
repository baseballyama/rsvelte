---
"@rsvelte/fmt": patch
---

fix(fmt): re-indent multi-line attribute expressions to the markup nesting level (#692)

A multi-line expression inside an element attribute (a multi-line arrow handler, a `bind:` getter/setter pair, …) was not re-indented to its position in the markup tree: the delegated expression formatter emits at column 0, so continuation lines collapsed toward column 0–2 instead of aligning under the attribute. The output was valid and idempotent, but visually broken — and a large share of the structural churn when adopting rsvelte on a real component tree.

Two changes in `rsvelte_formatter`'s open-tag rewriter:

- A multi-line attribute value now forces the multi-line tag layout (each attribute on its own line). Previously a short-by-char-count value with embedded newlines was treated as fitting on one line.
- In the multi-line layout, every continuation line of an attribute value is re-indented to the attribute column, so a multi-line `onclick={() => { … }}` / `bind:expanded={getter, setter}` aligns under the attribute and its closing `}}` sits at the attribute indent.
