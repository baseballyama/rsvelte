---
'@rsvelte/compiler': patch
---

Apply the rune arity and placement rules to a rune written in a template expression. The rules live in the script visitor and a template expression is walked by a second traversal, which hard-coded one of them and let `$props()`, `$host()`, `$bindable()`, `$effect()`, `$inspect.trace()`, a misplaced `$state`/`$derived` and every arity violation compile
