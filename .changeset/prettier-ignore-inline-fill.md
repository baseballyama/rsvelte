---
"@rsvelte/fmt": patch
---

Keep prose fill running across `<!-- prettier-ignore -->`'d inline nodes. An ignore comment
glued directly to a single-line inline node (e.g. `text <!-- prettier-ignore --><b>a  b</b>
more text`) used to end the prose run, so the whole surrounding paragraph was emitted on one
unwrapped line. The pair is now treated as a single verbatim atom of the fill: its own source
is still preserved byte-for-byte, but the text around it reflows normally.
