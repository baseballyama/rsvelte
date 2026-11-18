# `3045-update-trailing-comments.svelte`

**Issue:** [#3045](https://github.com/baseballyama/rsvelte/issues/3045)

`x++; /* c */` keeps the comment INSIDE the rewritten call (`$.update(x /* c */)`) because upstream reuses the located argument node; a trailing `// c` after `x--;` forces the two-arg call multiline — and the printer must not count a trailing-comment newline as "multiline statement" when deciding blank-line margins
