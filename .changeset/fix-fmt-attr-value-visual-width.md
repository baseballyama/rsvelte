---
"@rsvelte/fmt": patch
---

fix(fmt): measure attribute-value fit by visual width, not byte length

When deciding whether a wide single-line attribute value fits with its
trailing literal on the same line, the width check used the value's byte
length instead of its display width. For CJK (and other multi-byte) content
the byte count overcounts columns, so the check reported an overflow that
does not exist and the value was broken across lines unnecessarily. Use
`visual_width` for the value, matching the sibling force-break path.
