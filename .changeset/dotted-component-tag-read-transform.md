---
'@rsvelte/compiler': patch
---

A dotted component tag name now reads through its root binding's transform. Upstream lowers a
tag name by visiting the whole `b.member_id(name)` chain, and the rest-prop read rule is keyed
on the parent member expression — so transforming the root identifier alone never reached it,
and `<rest.Sub />` compiled to `rest.Sub` where the official compiler emits `$$props.Sub`,
while `{rest.Sub}` in the same component was already correct.
