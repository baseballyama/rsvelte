---
"@rsvelte/compiler": patch
---

fix(compiler): don't false-positive `store_invalid_scoped_subscription` when a `<script context="module">` declares a function

A function declaration in `<script context="module">` pushes its own function
scope, so the instance scope index is no longer always `1`. The scoped-store
guard in `walk_js_expression` / `walk_js_expression_node` hardcoded `1` as the
instance scope, so an instance-scope store (e.g. an imported store) referenced
inside a template arrow function was wrongly rejected with
`store_invalid_scoped_subscription`. The guard now compares against the real
`instance_scope_index`, mirroring upstream's `owner !== instance.scope` check.
Genuine scoped subscriptions (a store shadowed by an each-item binding or an
arrow parameter) still error. Fixes #1225 (svelte-form-builder `PropertyPanel`).
