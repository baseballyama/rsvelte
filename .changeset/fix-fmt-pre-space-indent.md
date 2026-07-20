---
"@rsvelte/fmt": patch
---

fix(formatter): keep space indentation inside space-indented `<pre>` bodies

`reformat_pre_inner` regenerated element-direct lines inside `<pre>` with tabs
unconditionally, but oxfmt preserves `<pre>` bodies verbatim — tabs are only
correct when the source itself was tab-indented. Block-tag lines (e.g. `{#if}`)
inside a space-indented `<pre>` now keep spaces, including the closing-tag line.
Formatter-parity baseline shrinks 48 → 46.
