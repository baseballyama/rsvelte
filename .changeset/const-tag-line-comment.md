---
"@rsvelte/fmt": patch
---

Keep a `{@const}` whose body ends in a `//` comment parseable. The trailing comment
moved the statement's `;` off the end, so the naive suffix strip left it in the tag
body, and the tag's own closing `}` was printed inside the comment.
