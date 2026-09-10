---
"@rsvelte/fmt": patch
"@rsvelte/language-server": patch
---

fmt: measure a following mustache up to its first break opportunity

When deciding whether an inline element or an earlier interpolation fits, the
breakable mustache behind it was charged up to the head of its outermost
group (`{record.holders` for a member chain). prettier stops at the first
line-break opportunity anywhere in the expression (`{record`), so
`<span class="label">Label text</span>{record` now keeps the span's hug and
breaks inside the mustache where the oracle does.
