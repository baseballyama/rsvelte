---
"@rsvelte/fmt": patch
---

fix(fmt): treat `&nbsp;` as significant content, not blank whitespace

The formatter detected insignificant whitespace-only text nodes with
`str::trim().is_empty()`. Rust's `char::is_whitespace` (used by `trim`) treats
U+00A0 — the decoded form of `&nbsp;` — as whitespace, so a block body / fragment
whose only content was `&nbsp;` was wrongly considered empty and collapsed away:
`{#if a}&nbsp;{/if}` became `{#if a}\n\n{/if}`, silently dropping the
non-breaking space that prettier / oxfmt preserve. A new shared `is_blank_text`
helper counts only ASCII whitespace as blank, so `&nbsp;`-only text now survives.
