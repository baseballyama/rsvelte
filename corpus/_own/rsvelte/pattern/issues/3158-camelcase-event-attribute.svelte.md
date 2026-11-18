# `3158-camelcase-event-attribute.svelte`

**Issue:** [#3158](https://github.com/baseballyama/rsvelte/issues/3158)

The server rendered `onClick={() => f(1)}` into the markup as an attribute holding a function, because its event-attribute test required a lowercase character after `on` in place of upstream's value-shape test. `on={f}` is the other end the length check got wrong, and `oN={f}` is the negative control — the prefix is case-sensitive. A valueless `onclick` cannot join them: both compilers reject it, which would make the whole file an error case and hide every other line
