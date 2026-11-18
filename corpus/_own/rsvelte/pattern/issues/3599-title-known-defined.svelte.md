# `3599-title-known-defined.svelte`

**Issue:** [#3599](https://github.com/baseballyama/rsvelte/issues/3599)

A single-expression `<title>` whose binding has a binary initializer. The title visitor used a literal/template-only definedness check instead of the shared scope-aware predicate used by its multi-chunk path, so it retained a redundant `?? ''`; output equality observes the extra expression even though both outputs behave the same
