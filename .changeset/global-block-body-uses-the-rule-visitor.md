---
'@rsvelte/compiler': patch
---

A `:global { … }` block's body now goes through the same `Rule` / `Atrule` visitors as
any other block, as upstream's transform does; only the scoping is skipped. The
non-minify path used to copy each child verbatim and apply deletion ranges, which can
express `remove_global_pseudo_class` but not the `/* (empty) … */` comment, so a nested
empty rule inside a lone `:global { … }` was emitted instead of being commented out.
