---
'@rsvelte/compiler': patch
---

In dev mode, each link of a chained assignment to a computed member now reports its own source position instead of the outermost link's.

`$.assign(…, '<file>:<line>:<column>')` locates the assignment's left-hand side. rsvelte matches
the lowered target back against a source-order site list keyed `(root, path, operator)`, and a
computed member contributes a valueless `Computed` element — so `o.p[2]` and `o.p[3]` share a key
and only the order the sites are consumed in separates them. The visitor claimed its site after
descending, so the inner link of a chain took the outer's site.
