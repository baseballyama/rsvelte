---
"@rsvelte/compiler": patch
---

fix: give each `bind:group` its own group name

Upstream keys a binding group on the expression — `(keypath, bindings)` — and
stores the winner on the directive's metadata. rsvelte's analysis computed the
same names but had nowhere per-directive to keep them, so the client visitor
took the enclosing `{#each}` block's single name and every `bind:group` inside
one block collapsed onto it. The second group was declared and never
referenced, and two checkboxes shared a group: checking one wrote through the
other's `bind:group` array.
