# `3166-ancestor-scoped-by-other-rule.svelte`

**Issue:** [#3166](https://github.com/baseballyama/rsvelte/issues/3166)

The subject class is `{cls}` in both halves, so `.keep` scopes it and the bypass has something to fire on; without a third rule that matches an indeterminate class the file reproduces nothing. `.c > .a` is the control the same source carries: a real child, where the chain matches and the ancestor must still be scoped. The two compilers agree on the CSS text here — only the emitted template differs
