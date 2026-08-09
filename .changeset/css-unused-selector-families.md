---
"@rsvelte/compiler": patch
---

Report `css_unused_selector` for five more selector shapes

`prune()` decides which selectors are reachable by walking one component's real
element tree. Five shapes were being kept alive by checks that asked a weaker
question than upstream does, so rules the official compiler reports as unused
were emitted with no warning.

- **An explicit `&`.** `.a { & .b { … } }` was kept whenever an `.a` existed
  anywhere. Upstream resolves `&` in place against the parent's prelude, so it
  requires an `.a` **ancestor** of the `.b`; a sibling, a descendant, or the same
  element carrying both classes does not match.
- **`:is()` / `:where()` / `:not()` arguments.** An argument list now constrains
  the compound it sits in, so `:is(.a) > .b` prunes when `.a` is not the parent
  of `.b`. `:not(...)` constrains nothing (its contents stay unscoped upstream),
  a multi-part branch is assumed to match, `:where` joins `:is`/`:has` in
  collapsing to one warning when every branch is unused, and a subject-less
  `:has(.a)` means `*:has(.a)` — the argument must match inside some element's
  subtree, not merely exist.
- **A compound must be satisfied by one element.** Each simple selector was
  checked for existence separately, so `.a.b` survived with `.a` and `.b` on
  different elements. This one is not specific to pseudo-classes; `#i.a` and
  `div.a:is(.b)` had it too.
- **`:root`.** `truncate` drops every simple selector except `:has` from a
  `:root` compound, so the unscoped `.x` in `:root.x:has(.a)` must not prune the
  rule — and a `>` out of a `:root` head is satisfiable only by a root-level
  element.
- **A trailing `:global(...)` on a parent rule.** A nested rule links to its
  parent through the truncated parent prelude, so `.a :global(.g) { .b { … } }`
  requires `.b` under `.a`.
- **`<svelte:element>` and attribute selectors.** An unknown tag name does not
  add attributes, so it no longer deopts every `[attr]` selector in the
  component. Only the *type* selector is exempt, as upstream.
