---
"@rsvelte/fmt": patch
---

fix(fmt): preserve `&nbsp;`-only blocks and stop over-breaking exactly-80-col attribute values

Two formatter-parity fixes:

- **`&nbsp;` treated as blank whitespace.** The formatter detected insignificant
  whitespace-only text nodes with `str::trim().is_empty()`, but Rust's
  `char::is_whitespace` treats U+00A0 (the decoded form of `&nbsp;`) as
  whitespace, so a block body whose only content was `&nbsp;` was wrongly
  collapsed: `{#if a}&nbsp;{/if}` became `{#if a}\n\n{/if}`, dropping the
  non-breaking space. A shared `is_blank_text` helper now counts only ASCII
  whitespace as blank.
- **Attribute value over-break at exactly 80 columns.** The single-line overflow
  guard in `render_single_expression_value` double-counted the opening `{` of
  `name={value}`, over-reporting the rendered width by one column, so an
  attribute whose value filled the print width exactly was needlessly expanded
  onto multiple lines.
