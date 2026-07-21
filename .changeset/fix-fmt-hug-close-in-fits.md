---
"@rsvelte/fmt": patch
---

fix(formatter): include the close tag in the hugged-content width measurement

When a multi-line open tag's hugged content line (`>{content}</tag`) overflows,
the Doc-IR reformat printed the body alone, so the printer's fits lookahead never
saw the close tag's width — an inner self-closing component whose own attributes
fit, but overflow once `</tag` is appended, never broke. The overflowing hugged
line is now printed as prettier's `group(['>', body, '</tag'])` with the dangling
`>` appended after, so the close tag participates in the fits measurement and the
inner component's attributes wrap exactly where the oracle wraps them.
