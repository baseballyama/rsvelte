---
'@rsvelte/compiler': patch
---

client: locate the `$props()` call among code bytes, not by substring

`transform_props_destructuring` found the call with a last-occurrence,
boundary-free substring search, so a trailing comment mentioning `$props` moved
the anchor into the comment and the declaration was spliced around it — the
client emitted the comment's own words in code position, which no JS parser
accepts. It now walks `js_scan::find_code_from`, which skips comments, strings,
templates and regex literals.

The comment's output slot is unchanged and still differs from upstream; that is
a separate defect. This restores the code, not the byte.
