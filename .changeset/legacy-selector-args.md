---
"@rsvelte/compiler": patch
---

fix(parse): three legacy-AST fields now come from the shape upstream produces

`PseudoClassSelector.args` keeps the modern `ComplexSelector` / `RelativeSelector`
shape, because upstream's `ComplexSelector` visitor rebuilds `children` from the
nodes as they were before the walk rewrote them; `Text.raw` survives the
surrounding-whitespace trim, which upstream applies to `data` alone; and
`Comment.ignores` comes from the one `extract_svelte_ignore`, whose lax branch
also appends a legacy code's modern spelling.
