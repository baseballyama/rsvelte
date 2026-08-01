---
"@rsvelte/compiler": patch
---

A `{@const}` that shadows a component-scope binding now resolves to the `{@const}` in the client transform. Previously the reactivity check looked the name up in the (root-scope-polluted) binding table and found the outer binding, so a compile-time-known `{@const}` read emitted an extra `$.template_effect` + `$.set_text` where the official compiler assigns `textContent` once, and a `{@const}` shadowing a **prop** was even rewritten to `$$props.<name>` — reading the wrong variable.
