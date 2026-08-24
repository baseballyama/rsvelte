---
'@rsvelte/compiler': patch
---

Keep a tag expression that ends in a `//` comment parseable. The expression was
handed to the JS parser wrapped in `(…)` on a single line, so a trailing line
comment swallowed the closing paren and `{@const x = flag // c}` was rejected
with `Expected ) but found EOF`. The official compiler accepts it.
