---
"@rsvelte/compiler": patch
---

fix(compiler): unthunk a call-expression destructuring default so `let { b = f() } = $derived(props)` emits `$.fallback($$props.b, f, true)` instead of an extra `() => f()` arrow, matching upstream's `b.thunk()`
