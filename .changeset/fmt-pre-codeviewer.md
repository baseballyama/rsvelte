---
"@rsvelte/fmt": patch
---

Formatter-parity: byte-parity for nested inline `<span>` highlighting inside
`<pre><code>` (`code-viewer`), via the `<pre>` verbatim re-indent subsystem
(text-only span collapse + sibling-span pack/unpack/overflow-split). `<pre>`
content is whitespace-verbatim, so it is handled by string-level re-indentation
by design (the documented exception to the Doc-IR element-layout rule); a faithful
Doc-IR `printPre` refactor remains tracked in `docs/corpus-fmt-remaining-work.md`.
Known-failures: 2 → 1.
