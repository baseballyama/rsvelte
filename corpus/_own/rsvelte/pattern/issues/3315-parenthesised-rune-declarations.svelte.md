# `3315-parenthesised-rune-declarations.svelte`

**Issue:** [#3315](https://github.com/baseballyama/rsvelte/issues/3315)

Every rune that lowers as a **declaration** wrapped in grouping parentheses. acorn builds no `ParenthesizedExpression`, so upstream cannot tell these from the bare calls; oxc preserves the node and every decision point missed it, leaving the rune name in output that still parses — `$props.id()` additionally emitted its `const` twice, which does not
