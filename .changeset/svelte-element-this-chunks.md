---
"@rsvelte/fmt": patch
"@rsvelte/language-server": patch
---

fix(fmt): a `<svelte:element this="h{n}">` opener is left as written instead of losing `{n}`

The parser keeps only the first chunk of a quoted `this` value (Svelte 5 compiles `this="h{n}"`
as `'h'`, with a warning), and the formatter rebuilt the attribute from that node, so everything
after the first chunk was silently deleted (#4717). When the value does not close right after its
first chunk the opener is now kept verbatim. prettier-plugin-svelte deletes the text the same way;
the two corpus files carrying the shape are excluded from formatter parity as an oracle bug.
