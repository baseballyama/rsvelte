# `4115-unresolved-renderer-renders-every-snippet.svelte`

**Issue:** [#4115](https://github.com/baseballyama/rsvelte/issues/4115)

The other end of the same axis. `{@render alias()}` resolves to no declaration and `<Comp {...extra} />` is a spread, so upstream's `if (!resolved) node.metadata.snippets = analysis.snippets` makes each a site of EVERY snippet — stronger than "unknown", which is why modelling it as a missing entry produced the opposite answer. `.never span` is the control: an unresolved renderer is a site of every snippet, not of every position, so a rule whose ancestor holds no renderer must still prune.
