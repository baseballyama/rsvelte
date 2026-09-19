---
"@rsvelte/language-server": patch
---

fix(lsp): an inlay-hint viewport that starts at `0:0` is clamped, not dropped

`textDocument/inlayHint`'s request range is the window the editor is painting, so
upstream's `convertToTargetTextSpan` maps its two endpoints independently and
substitutes offset 0 / the snapshot's length for whichever one has no shadow
position. rsvelte mapped the range as a unit and then rejected it when it landed
in generated code, and since an editor asks for the visible range — which starts
at `0:0`, before the shadow's prologue — the practical effect was that a
`.svelte` file got no inlay hints at all.
