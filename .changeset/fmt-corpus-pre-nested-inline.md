---
"@rsvelte/fmt": patch
---

Reach 0 known failures on the formatter-parity corpus (was 2): byte-parity for
deeply-nested inline elements inside `<pre><code>` (`code-viewer`,
`theme-customizer-code`). Extends the existing string-based `<pre>` verbatim
re-indent subsystem (`reformat_pre_inner` and helpers) to collapse text-only
`<span>`s and correctly pack/unpack/overflow-split sibling spans at the print
width, with fast-path guards and 0 regressions across the passing `<pre>`
corpus. (`<pre>` content is whitespace-verbatim — handled by string-level
re-indentation by design, the documented exception to the Doc-IR element-layout
rule; a faithful Doc-IR `isPreTagContent`/`printPre` printer is tracked as a
future refactor in `docs/corpus-fmt-remaining-work.md`.)
