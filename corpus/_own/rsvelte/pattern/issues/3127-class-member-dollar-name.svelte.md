# `3127-class-member-dollar-name.svelte`

**Issue:** [#3127](https://github.com/baseballyama/rsvelte/issues/3127)

A `$`-prefixed class member NAME. The `$`-reference scan already excluded object keys, member properties, string literals and comments; a class body was the shape it did not, so `class P { $abc() {} }` was rejected with `global_reference_invalid` and a `$inspect` member name flipped the component into runes mode. Carries both directions: a field initializer and a computed key that read a REAL store must still subscribe, and the three `;`-free fields are deliberate — where the member ends is decided by the value's last token, so `a = 1⏎$name()` must read like `a = 1;⏎$name()` while `a = 1 +⏎$store` must not. **This file is intentionally not semicolon-formatted**; both formatters were measured to agree on it, so it adds no fmt case
