---
'@rsvelte/compiler': patch
---

Lower `$props()` when a comment sits between the callee and its parentheses. The client canonicalises the call before its byte matchers run, and that regex admitted a comment only in the gap after `=` — so `$props/* c */()` and `$props(/* c */)` matched nothing, the text helper returned `None`, and its caller read that `None` as *not a props declaration*. The rune was then emitted verbatim: output that parses and throws `ReferenceError: $props is not defined` at first render, with no `rest_excludes` and no import. A comment is a separator wherever whitespace is one, so one gap now spells all three positions. The comment's own slot is unchanged and still differs from upstream, which is a separate defect; this restores the lowering, not the byte.
