---
'@rsvelte/compiler': patch
---

dev `$.assign` is not emitted for a member chain rooted at a global in a template expression

`build_assignment` is ported twice; the settled-script port already stopped at an
unresolvable root, and the template-expression converter did not — so an assignment
written in a legacy `on:` handler was still instrumented.
