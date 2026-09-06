---
'@rsvelte/language-server': patch
---

fix(lsp): a malformed request is an error, and a tag highlight is a `Read`

`textDocument/formatting` turned a params deserialization failure into a
successful empty result, so "I could not read your request" and "I have nothing
to change" reached the client as the same `[]`. It now answers `InvalidParams`.

`html_tags::highlights` emitted `DocumentHighlightKind::Text` where
`vscode-html-languageservice` (`htmlHighlighting.js:18,21`) — and therefore the
official server — emits `Read`.
