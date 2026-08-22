---
"@rsvelte/compiler": patch
---

Stop ending a `<style>` block at a `</style>` that sits inside CSS. `content: "</style>"` made the whole component fail with `unexpected_eof`, and `/* </style> */` with `element_invalid_closing_tag`, because the block's end was found by searching the raw bytes for the text. Upstream never runs that test inside a rule — `read_style` hands it to `read_body` as the `finished` predicate, which is consulted only at CSS top level between rules — so the terminator search now tracks strings, comments, brace depth and paren depth. An unquoted `url(</style>)` is a declaration value official emits verbatim, and a bare `</style>` one brace deep is CSS that official rejects with `css_empty_declaration`; both now agree.
