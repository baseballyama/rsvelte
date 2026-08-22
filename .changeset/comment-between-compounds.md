---
"@rsvelte/compiler": patch
---

Reject a CSS comment written between two compound selectors, as the official compiler does. Upstream's `read_selector` tolerates a comment only immediately before `,`, `{` or `)`; anywhere else it rewinds past it and falls through to `read_identifier`, which reports `css_expected_identifier` at the comment's `/`. rsvelte skipped them unconditionally, so `.a /* c */ .b { … }` compiled. A pseudo-class argument list now also ends at its last selector rather than at the `)`, matching official's `SelectorList` span when a comment precedes the paren.
