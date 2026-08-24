---
'@rsvelte/compiler': patch
---

Report the JS parse error in a `{@const …}` initializer, a `{#await …}` head and a `{@render …}` tag instead of swallowing it. All three routed their expression through a parse that recovers with an empty identifier, so ordinary broken JavaScript compiled — and in the `{@render}` case the empty identifier then failed the downstream call check, so a second error stood in for the one that was dropped. Upstream's `read_expression` throws unless the parser is loose, and its caller then expects the `}`, so leftover input after a complete expression is an `expected_token` while a malformed expression is a `js_parse_error`; both classifications now reach all three tags
