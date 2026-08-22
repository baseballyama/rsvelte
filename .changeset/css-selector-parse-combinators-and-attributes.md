---
'@rsvelte/compiler': patch
---

Read `||` and combinator runs (`>>`, `>>>`) in CSS selectors, reject malformed attribute selectors and empty selector-list entries where the official compiler does, and stop rejecting a declaration with no property name
