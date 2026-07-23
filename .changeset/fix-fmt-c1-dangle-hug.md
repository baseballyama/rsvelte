---
"@rsvelte/fmt": patch
---

Claim `{@render …}` tags in the children layout port (fixing which element dangles its close tag inside `{#if}/{:else if}` branches), print a whitespace-only element body as a single space, and follow prettier's `<pre>` child open-tag rules: dangle the child's `>` on multi-line content or overflow, re-hug it only when the attributes break, and break a child element's tag in preference to the `<pre>`'s own attributes.
