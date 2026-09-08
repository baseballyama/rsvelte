# `2661-concat-fold-source-text.svelte`

**Issue:** [#2661](https://github.com/baseballyama/rsvelte/issues/2661)

`'ab' + 'cd'` — the server's fold asked `starts_with('\'') && ends_with('\'')`, which a concatenation of two literals also answers yes to, and rendered the text between the outer quotes verbatim: `ab' + 'cd`
