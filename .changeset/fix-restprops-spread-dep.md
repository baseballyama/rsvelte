---
"@rsvelte/compiler": patch
---

fix(compiler): track `$$restProps` (and `$$props`) read via a spread in a legacy reactive statement

A legacy `$: x = { ...defaults, ...$$restProps }` dropped its
`$.deep_read_state($$restProps)` dependency, emitting
`$.legacy_pre_effect(() => {}, …)` instead of
`$.legacy_pre_effect(() => $.deep_read_state($$restProps), …)`, so the statement
no longer re-ran when spread rest-props changed. `body_references_identifier`
excluded a leading `.` (to avoid matching `obj.prop`), which also rejected the
spread `...$$restProps`. The `$$`-prefixed compiler specials are never
member-access targets, so a leading `.` is now allowed for them.
