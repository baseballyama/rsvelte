---
"@rsvelte/compiler": patch
---

A member update (`p.a++`) on a `$bindable()` or legacy `export let` prop now wraps in the prop setter so the parent is notified, in both prod and dev (where the ownership validator wraps outside the setter, like upstream); `$state(undefined)` keeps its source spelling instead of becoming `void 0`, and `$state(void 0)` constant-folds as a known undefined; a known const chunk of a dynamic `<title>` folds into the template text.
