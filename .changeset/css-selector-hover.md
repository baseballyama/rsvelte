---
'@rsvelte/language-server': patch
---

feat(language-server): hover a CSS selector with its element tree and specificity

`cssHover.doHover` walks the node path outermost-first and breaks at `Selector`,
so a pseudo-class, a pseudo-element and `:global()` are all answered there
rather than by the declaration arm. rsvelte answered none of them: hovering a
selector produced a bespoke `:global(...) prevents Svelte CSS scoping` string —
a sentence that appears nowhere in `language-tools` — or nothing at all.

This ports `selectorPrinting.js`'s `Element`, `toElement`, `MarkedStringPrinter`
and `Specificity` over the CSS AST `1_parse/read/style.rs` already produces, so
a selector now answers with the element tree and the specificity link, ranged
over the whole selector as upstream ranges it.

Two things the port turns on that are not visible in a table of answers.
`isPseudoElementIdentifier` is `/^::?([\w-]+)/` followed by
`getPseudoElement('::' + name)`, so **the pseudo-element/pseudo-class split is a
CSS-data lookup, not a colon count** — `p:before` scores `(0, 0, 2)` like
`p::before`, and rsvelte parses it as a `PseudoClassSelector`, so the node type
is not the classification. And `Element.addAttr` merges a repeated name with a
space, so `.a.b` renders `class="a b"` rather than two attributes.

A selector answers with a `MarkedString[]` where a declaration answers with a
`MarkupContent` (`CSSPlugin.doHoverInternal` passes the `Hover` through
untouched), so `css::hover` now returns which of the two it produced.
