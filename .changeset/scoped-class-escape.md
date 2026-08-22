---
"@rsvelte/compiler": patch
---

HTML-escape a folded class literal before appending the scoping hash, as `escape_html(value, true)` does upstream, so `class="&lt;{n}"` stays `'&lt;1 svelte-hash'` instead of becoming the decoded character. The hand-inlined copy of that join in the `<svelte:element>` visitor is gone — upstream reaches `build_set_class` once for this case.
