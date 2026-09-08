# `3155-nth-child-chain-evaluable.svelte`

**Issue:** [#3155](https://github.com/baseballyama/rsvelte/issues/3155)

`.b > :nth-child(2)` survived with `.b` empty, because the pseudo-class made the chain unevaluable rather than unconstraining. `:first-child` is here beside it since the defect is the argument-taking pseudo-class as a class, not `nth-child`; each appears once prunable and once matching, because "unevaluable" and "unconstraining" agree on the matching half
