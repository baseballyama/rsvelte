---
'@rsvelte/compiler': patch
---

Accept the full HTML `PotentialCustomElementName` production for element names and every ECMAScript `ID_Continue` character in a snippet name, and fix the three divergences those over-rejections were hiding: a declarator span whose end came from the generated identifier's byte length (a panic on a non-ASCII tag name), an ASCII-only guard around the `toLowerCase` of an HTML tag name, and an identifier sanitizer that counted characters where upstream's regex counts UTF-16 code units. Element-vs-component classification now uses upstream's `regex_valid_component_name`, so `<X-a>` and `<x-a.b>` are regular elements rather than component calls.
