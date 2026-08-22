---
"@rsvelte/fmt": patch
---

The formatter's text collapsing now uses the HTML whitespace class (`[\t\n\f\r ]`) instead of Unicode whitespace, so U+2028/U+2029 line separators and U+3000 ideographic spaces in text content survive formatting instead of being collapsed to a space or trimmed away.
