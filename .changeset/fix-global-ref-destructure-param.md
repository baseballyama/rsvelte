---
"@rsvelte/compiler": patch
---

fix(analyze): don't report `global_reference_invalid` for a `$`-prefixed destructured callback parameter

A `$`-prefixed identifier bound by an array/object destructuring parameter — e.g. `derived([box_d], ([$box]) => $box.width)` — was wrongly treated as a store subscription and rejected with `global_reference_invalid` (`box` has no store binding). The lexical `$`-identifier scan only recognised `($x)` / `let $x` declaration forms and missed destructuring patterns. Before erroring, the unprefixed-name lookup now also checks whether the full `$name` is itself a real (non-synthetic) scope binding and, if so, treats it as a local reference. The guard sits at the error path so a genuine store whose name also appears as a nested callback parameter (e.g. `page` used as `$page` in the template and as `($page) => …` in `.subscribe()`) still subscribes correctly.
