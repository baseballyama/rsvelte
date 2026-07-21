---
"@rsvelte/compiler": patch
---

fix(client): emit `$.invalidate_inner_signals` for prop member mutations inside `$:` reactive statements (legacy `<select bind:value={prop…}>` indirect bindings), matching the instance-script mutation path
