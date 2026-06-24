---
"@rsvelte/fmt": patch
---

fmt: narrow a wrapped `class:NAME={EXPR}` directive value by its `class:NAME=`
prefix, like `style:` / `on:` / `use:` already do (#795). When the open tag
wraps and the directive's full line overflows the print width, its value now
breaks at the right operator instead of staying flat past the margin.
