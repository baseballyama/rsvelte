---
"@rsvelte/compiler": patch
---

fix(compiler): keep store reads intact when the store name is not ASCII

The identifier pre-filter extracted words with ASCII-only byte predicates, so a
store subscription named with non-ASCII characters never matched and the read was
left untransformed. Fixing that exposed a second defect the first one had been
hiding: the read rewriter advanced a `char` index by the name's **byte** length,
dropping source text after every match. Both are fixed together, because fixing
only the pre-filter turns a missing transform into lost output.
