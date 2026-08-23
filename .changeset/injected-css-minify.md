---
"@rsvelte/compiler": patch
---

Minify the injected stylesheet the way upstream does. `css: "injected"` (and every custom element, which injects unconditionally) emitted a `;` after every declaration on top of the one already in the source, doubled the opening brace of a rule with a nested rule — leaving the stylesheet with unbalanced braces — and kept the whitespace `remove_preceding_whitespace` removes. A declaration's span ends at the `;` or `}`, so the separator comes from the source; the whitespace runs before a rule, before a declaration and before a block's closing brace are now dropped from the emitted text rather than from a gap. `animation` / `animation-name` declarations, at-rules and their closing braces keep their whitespace, matching upstream's visitor split, and `@font-face` and `:global {…}` bodies are minified like any other block. `css.code` — the only thing the corpus gate compares — was already correct and is unchanged.
