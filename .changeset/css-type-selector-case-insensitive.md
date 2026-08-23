---
"@rsvelte/compiler": patch
---

Match a CSS type selector against an element name case-insensitively, as upstream's `apply_selector` does (`element.name.toLowerCase() !== name.toLowerCase()`). rsvelte compared the two exactly in the prune path, so `DIV` was pruned as unused against a `<div>` — the rule was replaced by an `/* (unused) … */` comment and a `css_unused_selector` warning official does not raise, and the component silently lost the rule. SVG's camelCase element names are the case that bites in real code: `clippath` and `lineargradient` select `<clipPath>` and `<linearGradient>` upstream. `:is(DIV)` shows the same defect with byte-identical CSS and only the warning set differing.
