---
"@rsvelte/compiler": patch
---

Rewrite every subscribed store, and both kinds of update expression, in one pass

Two spots in the client instance-script pipeline parsed and re-printed the same
statement more than once for work a single traversal already covers:

- store member mutations ran one parse + print **per subscribed store**, even
  though the rewriter matches every store in one traversal and looks
  `prop_store_names` up by name;
- the prop and state update-expression passes are the same visitor called with
  complementary argument lists, and its classifier already tries props first —
  which is exactly what running the prop pass before the state pass did.

All 14,036 compiled outputs (four real-world corpora × client/server ×
prod/dev) are byte-identical. This removes parses deterministically; it is not
a measured wall-clock win — interleaved paired runs came back inside noise on
all four corpora.
