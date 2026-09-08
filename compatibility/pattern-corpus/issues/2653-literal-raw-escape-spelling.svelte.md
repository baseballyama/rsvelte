# `2653-literal-raw-escape-spelling.svelte`

**Issue:** [#2653](https://github.com/baseballyama/rsvelte/issues/2653)

A single-quoted string literal in a template expression. esrap writes a literal's `raw`, so official's output carries the source spelling; rsvelte kept `raw` only when it started with `"` and re-printed everything else from the cooked value, turning `'a\tb'` into a real tab and `'\x41'` into `'A'`. The **value is right** and the output parses — a source-text divergence, invisible to the parse gate. Deliberately unformatted: the fmt oracle rewrites the quotes to `"`, which is the one shape that already worked
