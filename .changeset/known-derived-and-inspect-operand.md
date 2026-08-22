---
"@rsvelte/compiler": patch
---

A `$derived` whose argument is a compile-time known value is no longer treated as reactive, so `{rd}` over `$derived(1)` writes `textContent` once instead of templating a text node and a `$.template_effect` — the template string itself differed (`<b></b>` vs `<b> </b>`), so the two hydrated against different DOM. A binding stores a literal initializer as its own source text rather than as node JSON, and the "is this value known" check only understood the JSON form.

A production-mode `$inspect(…)` in a value position keeps its slot filled with `undefined` instead of leaving `let v = ;`, which no JS parser accepts, or `const o = [];`, which drops the element.
