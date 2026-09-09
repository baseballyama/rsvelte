---
'@rsvelte/compiler': patch
---

Keep a `$props()` declaration's comment whose text also occurs in a string, a template literal or another comment, and stop truncating the declaration at a `;` written inside its own comment — which emitted an unterminated `/*` fragment
