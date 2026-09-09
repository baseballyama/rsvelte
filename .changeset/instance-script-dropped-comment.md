---
"@rsvelte/compiler": patch
---

client: emit an instance-script comment the located flush drops entirely

Under split coordinates a comment lives above `loc_base` and an original source
position lives below it, so `has_loc` — which answers "may this node carry
comments" — reads a real source offset as "no location" and
`flush_comments_until` returns before writing anything. A comment with no
comment-space node after it is therefore never emitted at all, which is what a
`<script>` whose template lowers to a component call produces.

The printer now runs a second pass when the first one dropped a comment, and
that pass may flush **only** the dropped set from source space. Restricting it
to what the ordinary path loses is what separates a recovery from a relocation:
measured over the corpus, the rule fixes 22 units and moves none. The second
pass runs on 0.86% of compiles.
