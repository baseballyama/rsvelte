---
"@rsvelte/fmt": patch
---

fix(formatter): normalize inter-interpolation whitespace in wrapped attribute values

A `style:`/regular attribute value made of multiple interpolations where at
least one wraps (e.g. two nested ternaries in `style:transform-origin`) took the
whole-value re-indent path, which prepends the attribute indent to every line.
The literal whitespace BETWEEN interpolations still carried its source
indentation, so the re-indent double-indented the second interpolation's opening
line. That structural whitespace (a depth-0 newline whose next content is the
next `{`) is now stripped before re-indent, matching prettier's normalization to
the attribute indent; literal text lines keep their source indentation verbatim.
