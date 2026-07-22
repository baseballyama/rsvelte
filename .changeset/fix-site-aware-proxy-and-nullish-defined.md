---
"@rsvelte/compiler": patch
---

fix(client): per-site proxy decision for bare-identifier assignment RHS resolved to a function-local declaration, and upstream-faithful `is_defined` for `unknown ?? b` initializers (no narrowing when the left side is not statically known)
