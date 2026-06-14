---
"@rsvelte/fmt": patch
---

Improve Svelte-structure formatting parity with prettier-plugin-svelte: strip
quotes around single-mustache attribute values (`attr="{expr}"` → `attr={expr}`),
reorder top-level sections into canonical order (`svelteSortOrder`: options →
module script → instance script → markup → styles), and trim child boundary
whitespace for components and block elements while keeping an edge space for
inline/custom elements. Verified by the new full-corpus formatter-parity gate
(`scripts/compat-corpus` fmt track).
