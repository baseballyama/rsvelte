---
"@rsvelte/fmt": patch
---

fix(fmt): stop over-breaking interpolations inside string attribute values

An embedded `{expr}` inside a quoted attribute value (`class="{…} text"`,
`style="…{expr}…"`) was broken more aggressively than the oxfmt /
prettier-plugin-svelte oracle:

- The "doesn't fit on one line" path re-formatted the expression narrowed by the
  *trailing* literal width, so a call like `fieldError(form, 'fullName')` inside
  `class="{fieldError(form, 'fullName') ? … } mt-1 …"` exploded into multi-line
  arguments instead of breaking only the top-level ternary (the trailing text
  belongs on the final continuation line, not the first). It now always picks the
  minimal break point.
- The trailing-width estimate summed *all* following literal text, including text
  on later physical lines of a multi-line string value (`style="…\n\twidth: {r *
  2}px;\n…"`), so a trivial `{r * 2}` was force-broken to fit a phantom-long line.
  Trailing width now stops at the next newline.

Net: 9 real-world corpus files (cmsaasstarter, layercake, …) now format
byte-identically to the oracle, with no regressions.
