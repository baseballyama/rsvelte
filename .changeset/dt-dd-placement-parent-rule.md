---
"@rsvelte/compiler": patch
"@rsvelte/svelte-check": patch
---

fix(analyze): validate `<dt>`/`<dd>` placement against the parent rule, not an ancestor check, so a valid nested `<dl>` inside `<dd>` is accepted (#721)
