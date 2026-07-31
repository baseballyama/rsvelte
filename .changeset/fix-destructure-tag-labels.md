---
"@rsvelte/compiler": patch
---

fix(compiler): label destructured `$derived` / `$state` declarations in dev — leaf bindings by name, the `$$array` temps by pattern kind (`[$derived object]` and friends), and legacy destructured state sources by name
