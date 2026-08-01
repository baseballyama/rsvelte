---
"@rsvelte/compiler": patch
---

fix(compiler): instrument legacy (non-runes) instance scripts in dev mode — `a === b` now emits `$.strict_equals(a, b)` (and `!==` / `==` / `!=` their counterparts) and `await X` emits `(await $.track_reactivity_loss(X))()`, matching the official compiler, which runs the same client visitors for legacy and runes components
