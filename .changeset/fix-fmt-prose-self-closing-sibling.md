---
"@rsvelte/fmt": patch
---

Keep the leading hardline for prose text that follows a self-closing sibling (`<Code … />`), matching prettier's untrimmed `splitTextToDocs` fill so the last word tolerates overflow instead of wrapping early.
