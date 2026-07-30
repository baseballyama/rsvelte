---
"@rsvelte/compiler": patch
---

Emit dev-mode `$$ownership_validator.binding()` calls inside the `$.component` callback for dynamic components, so bindings on member-expression components no longer throw a `ReferenceError`
