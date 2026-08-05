---
"@rsvelte/compiler": patch
---

Resolve `$state` reassignment per binding in `.svelte.(js|ts)` modules, so same-named `$state` locals in sibling scopes no longer collapse into one classification and lose their `$.state(...)` wrapper.
