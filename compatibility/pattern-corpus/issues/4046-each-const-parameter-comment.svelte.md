# `4046-each-const-parameter-comment.svelte`

**Issue:** [#4046](https://github.com/baseballyama/rsvelte/pull/4046)

A comment in the `{@const}` initializer of an each block's first child, which upstream flushes after the item parameter of the generated callback. oxc's `FormalParameter` wrapper is builder-made in generated output, so its span bounds no comment — the located pattern inside it is the ESTree node esrap reads.
