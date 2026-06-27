---
"@rsvelte/compiler": patch
---

fix(transform): wrap a non-sole store read inside `$derived(...)`

A store subscription that was the FIRST token of a larger `$derived(...)` /
`untrack(...)` argument (`$derived($store.x / 2)`) was wrongly left bare. The
bare-getter collapse now only applies when the store ref is the SOLE argument
(`$derived($store)`); otherwise it is wrapped to `$store()`.
