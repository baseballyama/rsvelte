---
"@rsvelte/compiler": patch
---

fix(compiler): instrument module scripts in dev mode — `await X` inside a component's `<script module>` or a `.svelte.(js|ts)` module now emits `(await $.track_reactivity_loss(X))()`, matching the official compiler, whose `AwaitExpression` visitor runs over every script kind
