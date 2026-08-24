---
"@rsvelte/compiler": patch
---

Decide whether a client template read is reactive from `scope.evaluate`, not from how the declaration was lowered. Three divergences: a `{@const}` bound to a function declaration is reactive (a function evaluates to a symbol, which is never `is_known`); `customElement` forces `accessors`, which keeps the `$.state(…)` declaration but must not make a never-written `$state`/`$derived` read reactive; and a pure global call over known arguments (`String(w)`, `Number.isInteger(1)`) is a known value, so the `{@const}` reading it needs no `template_effect`.
