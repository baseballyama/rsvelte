---
'@rsvelte/compiler': patch
---

The namespace scan now stops at the first **html** element, as upstream does, rather than at the first element of any kind. An `<svg>` in an `{#if}` branch stopped the walk before the sibling branch was reached, so a branch whose content is html was templated with `$.from_svg`.
