---
"@rsvelte/compiler": patch
---

Raise `snippet_invalid_rest_parameter` during analysis rather than during parsing, so `parse()` accepts the same input official's does — the formatter and the language server both lost the whole document to it. The error's `end` now comes from the parameter node instead of a fixed offset.
