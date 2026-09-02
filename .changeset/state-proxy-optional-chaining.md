---
'@rsvelte/compiler': patch
---

`$state(p?.x)` keeps its `$.proxy`. Upstream's `should_proxy` proxies everything
it does not recognise as primitive; rsvelte's sniff proxied only what it did
recognise, and an optional chain matched no member or call predicate because
`p?.x` splits into `p?` and `x`. The chain is now read in its plain form, with
`?.` followed by a digit left alone — there it opens a ternary, not a chain.
