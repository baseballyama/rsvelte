# `3201-template-fast-path-octal.svelte`

**Issue:** [#3201](https://github.com/baseballyama/rsvelte/issues/3201)

`{0755}` — a bare numeric literal, which `try_parse_simple_expression` builds without ever calling OXC. `{[0755]}` was rejected while this was accepted, so the EXPRESSION SHAPE decided whether the rule applied; the fast path now declines anything that could carry a violation
