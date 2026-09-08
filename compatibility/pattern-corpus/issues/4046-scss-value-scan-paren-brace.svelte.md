# `4046-scss-value-scan-paren-brace.svelte`

**Issue:** [#4046](https://github.com/baseballyama/rsvelte/pull/4046)

`read_value` tracks exactly one bracket — `url(` — so the `{` of an SCSS `#{$y}` inside `var(…)` still ends the value and makes the item a nested rule, which then fails on the selector. Counting paren and bracket depth instead swallows that brace and the file compiles, which no gate keyed on "both reject" can see.
