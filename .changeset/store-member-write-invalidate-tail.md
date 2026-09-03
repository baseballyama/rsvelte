---
"@rsvelte/compiler": patch
---

A `<select bind:value={$store.x}>`'s indirect bindings now attach to the `$store`
binding, so a store member write emits the `$.invalidate_inner_signals` tail
upstream emits — while `$store.x++` still does not, because `UpdateExpression.js`
never imports `build_assignment`.
