---
"@rsvelte/compiler": patch
---

A destructuring assignment caches its right-hand side from the visited read

`shared/assignments.js:20-22` decides `should_cache` with `value.type !== 'Identifier'` on the
**visited** node, so a runes prop that is never written — which reads as `$$props.data` — is
cached in `$$value`. rsvelte answered that from the list of props eligible as assignment
targets, which excludes exactly those.
