---
'@rsvelte/compiler': patch
---

An each item that is reassigned now reads as `collection[$index]` inside an inner `bind:`'s invalidation dependency list, as it already did everywhere else.

Upstream reads a reassigned each item as `collection[$index]` and never as `$.get(item)`
(`EachBlock.js:216-227`). rsvelte ports that rule as `build_reassigned_item_read` and applies it
at eight sites; the dependency list an inner `bind:` hands to `$.invalidate_inner_signals` is a
ninth, built by a string loop that consults `state.transform` directly, so the rule never reached
it. Every other read of the item in the same output was already correct.
