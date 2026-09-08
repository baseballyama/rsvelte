# `3125-let-directive-paren-default.svelte`

**Issue:** [#3125](https://github.com/baseballyama/rsvelte/issues/3125)

The oracle's own spelling of a `let:` pattern default — `[(head = 'none')]`, `meta: ({ n } = {})` — which Svelte reads as an expression and accepts. rsvelte-fmt parsed the value as a binding pattern, where the parens are a syntax error, so the whole file came back unformatted with exit 2. This is the shape a formatted repository actually holds, and the compilers must agree on it as well
