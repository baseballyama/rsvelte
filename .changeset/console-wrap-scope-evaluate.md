---
"@rsvelte/compiler": patch
---

fix(compiler): decide the dev-mode `console.*` wrap with `scope.evaluate` — `$.log_if_contains_state(...)` now wraps exactly the calls the official compiler wraps. Template-position calls (event handlers, `{expr}`, `$:` bodies) were never wrapped at all, and calls whose arguments a template literal, a `+`/comparison operator or a resolvable binding proves cannot hold state were wrapped when they should not be
