# `2006-form-feed-text.svelte`

**Issue:** [#2006](https://github.com/baseballyama/rsvelte/issues/2006)

A form-feed (`&#12;`) text node is **content**, not whitespace — `regex_not_whitespace = /[^ \t\r\n]/` excludes `\f`
