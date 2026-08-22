---
"@rsvelte/compiler": patch
---

Keep a namespaced type selector's prefix in the emitted CSS (`svg|circle`, `*|div` were printed as `circle` / `div`, because the printer used the AST `name`, which upstream deliberately stores without the namespace so element matching works). Type selectors now read back from the source like class and id selectors already did. `css_nesting_selector_invalid_placement` also carries the `&`'s span instead of no position at all, and a `&` inside a pseudo-class argument list is judged by the same rule as one outside it — `.a:is(&)` was accepted where official rejects it.
