---
"@rsvelte/compiler": patch
---

fix(compiler): drop redundant parentheses from dev equality instrumentation operands in module scripts — `export const x = (a === b) != (c == d);` now emits `$.equals($.strict_equals(a, b), $.equals(c, d), false)` like the official compiler instead of `$.equals(($.strict_equals(a, b)), ($.equals(c, d)), false)`
