---
"@rsvelte/compiler": patch
---

Expand a destructured rune declarator in a module script. `let { a } = $state(1)` in a `<script module>` or a `.svelte.(js|ts)` file compiled to `let { a } = $.state(1)`, which destructures the signal object rather than its value, so the binding was `undefined` at runtime; it now expands to `let tmp = 1, a = $.proxy(tmp.a)` the way the official compiler and rsvelte's own instance script already do. Covers `$state`, `$state.raw`, `$derived` and `$derived.by` against object, default, rest, non-identifier-key and array patterns, plus `$state.snapshot` on the server. The dev-mode `$.tag` passes no longer label the compiler's own `$$d` / `$$array` temps.
