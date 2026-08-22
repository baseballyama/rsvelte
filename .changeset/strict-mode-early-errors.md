---
'@rsvelte/compiler': patch
---

Reject the strict-mode early errors a component script inherits from being an ES module — legacy octal literals and escapes, `delete` on a bare identifier, duplicate parameter names, `eval` / `arguments` as an assignment target or a binding, the strict reserved words, an Annex B function declaration as a statement body, and a duplicate `__proto__` — which OXC accepts and the official compiler rejects
