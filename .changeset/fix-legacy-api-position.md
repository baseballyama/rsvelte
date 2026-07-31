---
"@rsvelte/compiler": patch
---

fix(compiler): put the dev-mode `...$.legacy_api()` spread first in a legacy component's `$$exports` object instead of last, matching the official compiler
