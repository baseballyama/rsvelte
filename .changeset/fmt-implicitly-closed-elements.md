---
"@rsvelte/fmt": patch
---

The formatter now closes implicitly-closed HTML elements, matching prettier-plugin-svelte: `<ul><li>a<li>b</ul>` formats to one `<li>…</li>` per line instead of surviving unrepaired. Three things had to line up — a synthetic close tag when the element's end abuts its next sibling (nothing to replace, so nothing was emitted), coincident zero-length inserts now emitting in push order so the close tag lands before the separator that follows it, and the mismatched-close-tag fallback no longer claiming a `</…>` that belongs to the element's last child.
