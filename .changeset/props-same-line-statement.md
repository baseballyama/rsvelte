---
"@rsvelte/compiler": patch
---

Fix client output that no JS parser accepts when a `$props()` declaration shares its source line with another statement. `let p = $props(); void p;` emitted `let p = $.rest_props($$props, rest_excludes)void p;`, because the rewrite dropped the `;` from its own replacement on the assumption that a line break follows it. A `$props.id()` declaration on a shared line hit a second site — the per-line loop dropped the whole physical line — and emitted the hoisted `const` twice.
