---
"@rsvelte/compiler": patch
---

fix(compiler): count every dev-mode source location in UTF-16 code units. `$.push_element`, `$.apply`, `$.add_svelte_meta` and `$$ownership_validator.mutation` each re-implemented the byte-offset → line/column conversion and counted one column per code point, so an emoji (surrogate pair) earlier on the line reported a column one short of official's `locate-character`. The four duplicates are now a single shared locator alongside the already-correct `$.add_locations` one.
