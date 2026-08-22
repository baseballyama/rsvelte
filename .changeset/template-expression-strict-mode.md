---
'@rsvelte/compiler': patch
---

Apply the acorn-only restrictions to template expressions, not only to `<script>` — a template expression is an ES module fragment and is strict for the same reason. The fast path for identifiers, numbers, strings and simple compounds now declines anything that could carry a violation instead of bypassing the parser, and a mustache parse error is reported as a point at the offending token rather than as a range over the whole expression
