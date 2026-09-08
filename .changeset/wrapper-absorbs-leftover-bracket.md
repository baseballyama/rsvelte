---
'@rsvelte/compiler': patch
---

A leftover `)` after a complete mustache expression is now `expected_token` at that
token, matching the official compiler. `{a)}` reported `js_parse_error` at a column that
exists only inside the `(…)` the leftover-input probe wraps the body in: the probe's own
`)` closed against the source's, so the leftover moved past the end of the content and the
classification fell through. `{a]}` was already right, which is what shows the axis is "a
leftover bracket **this wrapper closes**" rather than "a leftover bracket" — the probe now
runs with both bracket pairs and each covers the other's blind spot. Separately, an
expression that runs out of input reports acorn's `Unexpected token` rather than the
delimiter OXC wanted.
