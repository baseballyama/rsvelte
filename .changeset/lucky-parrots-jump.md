---
'@rsvelte/compiler': patch
---

Give the SSR store-destructure scan a single offset unit. It walked characters
but handed its cursor to `find_matching_open` and `find_expression_end`, which
walk bytes, then consumed the byte offsets they returned as character offsets.
One non-ASCII character anywhere earlier in the script — in an unrelated string
literal, say — was enough to slide the pattern and RHS slices off their real
positions, and the destructure was not skipped but corrupted: the property key
was dropped and the parentheses left unbalanced, so the script no longer parsed.
The store name itself never had to be involved. The scan now uses byte offsets
throughout, like the client-side sibling pass. No emitted output changes today:
component scripts are lowered by the AST pipeline, which already handled this
correctly.
