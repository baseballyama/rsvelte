---
"@rsvelte/compiler": patch
---

Span `attribute_duplicate` over the whole attribute rather than its name. Upstream passes the attribute node, so the underline reaches the end of the value — or of the `{…}` for a shorthand.
