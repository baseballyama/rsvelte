# `reactive-chain-comment-join.svelte`

**Issue:** mutation ratchet

`transform_reactive_statement` collapses a `.name` continuation onto the previous line so its assignment detection sees one unit, and the scan already declines to collapse a `...` spread because joining one onto a line that ends in a `//` comment swallows it — but not a line that IS such a comment. The joined `.catch(...)` then lands inside the comment and every line of its multi-line callback is orphaned, so the client emits text no JS parser accepts and the callback body is never transformed. Three axes are needed together (a block-bodied `$:`, a `//` comment, a multi-line callback); the delimiter is NOT one of them — a plain `// c` reproduces it identically.
