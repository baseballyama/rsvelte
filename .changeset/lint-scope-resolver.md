---
"@rsvelte/compiler": patch
"@rsvelte/language-server": patch
---

`svelte/no-top-level-browser-globals` now uses real scope resolution (oxc_semantic) instead of name matching: local bindings that share a browser global's name — `let { open = $bindable() }` props, imports, `let top` — are no longer falsely flagged, in both `<script>` and template expressions. Fail-safe: unresolvable scripts fall back to the previous behaviour.
