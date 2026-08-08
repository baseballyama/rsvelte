---
'@rsvelte/compiler': patch
---

Cook every escape when folding a known-const string, not just the codepoint ones. `const sep = '\\'` folded into `<p>{sep}</p>` emitted `p.textContent = '\\\\'` — the escape survived the fold and was escaped a second time on the way out, so the component rendered two backslashes. `\n`, `\t`, `\r`, `\v`, `\b`, `\f`, `\'`, `\"`, a surrogate pair and a line continuation were wrong the same way, on client, server and client-dev alike.
