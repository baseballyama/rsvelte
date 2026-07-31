---
"@rsvelte/compiler": patch
---

fix(compiler): emit the dev-mode `$.check_target(new.target)` guard (and the `componentApi: 4` `new.target` early return) ahead of the `$$slots` / `$$sanitized_props` / `$$restProps` preamble, matching the official compiler's statement order
