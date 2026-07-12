---
"@rsvelte/compiler": patch
---

fix(transform): don't prune a `&`-nested selector under a `:global(...)` parent

`:global(:where(.x)) { &[data-y='z'] { … } }` — the nested `&[data-y]` compound
resolves its `&` to the fully-global parent, so it is itself global and must not
be pruned as "unused", even when no local element matches it (mirrors upstream,
which keeps such rules). rsvelte still ran the unused check in that context and
commented the rule (and its selector list) out. Both the whole-rule check
(`transform_rule_preserving`) and the per-selector inline marker
(`transform_selector_list`) now skip a `&`-nested selector inside a global-selector
context. The skip is limited to attributes / plain pseudo-classes on `&`; a
functional pseudo argument (`&:has(.unused)`, `:is`/`:where`/`:not`/`:global`) is
still matched against the DOM and pruned when it does not match. Clears layerchart
Labels.base.svelte.
