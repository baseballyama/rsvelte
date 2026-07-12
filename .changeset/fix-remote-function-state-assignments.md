---
"@rsvelte/compiler": patch
---

fix(transform): compile assignments to `$state` that broke SvelteKit remote functions (#1438). A logical compound assignment (`??=`/`||=`/`&&=`) to a private `$state` field inside a method/getter, and an object/nested destructuring assignment to a module-level `$state` variable, were both miscompiled to invalid assignment targets. They now lower to `$.set(...)` matching the official compiler.
