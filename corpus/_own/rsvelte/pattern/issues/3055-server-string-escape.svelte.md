# `3055-server-string-escape.svelte`

**Issue:** [#3055](https://github.com/baseballyama/rsvelte/issues/3055)

A never-reassigned `$state('\\\'')` folded on the server by stripping the quotes RAW, so the template writer re-escaped the source spelling — `\'` rendered as three backslashes + quote. The fold now stores the cooked value, like every other constant site
