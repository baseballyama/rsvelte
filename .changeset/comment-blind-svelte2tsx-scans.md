---
'@rsvelte/compiler': patch
'@rsvelte/svelte2tsx': patch
'@rsvelte/svelte-check': patch
---

Stop `svelte2tsx` reading code out of a comment or a literal. Upstream answers this with its parser — `findNextVerbatimElement` opens its regex with a `(<!--[^]*?-->)` arm and skips any match that starts with it, `ComponentEvents` walks the TypeScript AST, and `Stores` is fed by the Svelte AST walk — while three scans here answered from bytes. So a `<script>` inside an HTML comment was recovered as an orphan script and its body injected ahead of the imports, a `dispatch('x')` inside a `//` comment became a component event, and a `$name` inside a template expression's comment or template literal became a store subscription. `js_scan::opaque_runs` reports a JS region's comments, strings, regex literals and template-literal text chunks (a `${…}` substitution stays code), and the three scans consult it.
