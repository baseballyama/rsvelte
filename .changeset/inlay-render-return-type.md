---
'@rsvelte/language-server': patch
---

`textDocument/inlayHint`: the generated `$$render` header's return-type slot is found from the shadow's AST instead of a text needle, so the hint is dropped on components that import anything
