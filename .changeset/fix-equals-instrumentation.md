---
"@rsvelte/compiler": patch
---

fix(compiler): instrument `==` / `!=` as `$.equals(...)` in dev, and mark the negated comparisons with the trailing `false` argument the official compiler emits instead of an outer `!`
