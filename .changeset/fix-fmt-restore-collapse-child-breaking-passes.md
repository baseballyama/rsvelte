---
"@rsvelte/fmt": patch
---

fix(formatter): restore the collapse child-breaking passes retired as "dead" in #1505

#1505 removed collapse passes 1.6–1.95 and the final children-port sweep on the
premise that they were dead code. They were not: every one of those passes is
load-bearing for real corpus components, so their removal regressed the
formatter-parity corpus — 11 components that had matched the `oxfmt(svelte: true)`
oracle byte-for-byte began diverging, all in the same family of "the element
should break its children / open tag onto their own lines but rsvelte keeps them
inline" (e.g. `<button …> Add Day </button>` staying on one line, a `<Span>` open
tag not breaking on an overflowing prose line, an SVG `<clipPath>`/`<rect>` pair
not hugging, a Component block child `<div>` not breaking, a `<script></script>`
sibling of an `{@html}` not breaking).

Each retired pass is required by at least one of those regressions:

- 1.6 `try_collapse` sweep — inline pure-text elements revealed by pass-1
  restructuring (card-air / calendar-test / ListGroup).
- 1.7 `hug_mixed` non-ws-prefix sweep — SVG child hug (flowbite Microsoft icon).
- 1.8 block-break non-ws-prefix — Component block child (svelte print `formatting`).
- 1.9 break-inline-open-tag — overflowing inline/component open tags
  (TextDecoration / Underline / html-tag-script-2).
- final children-port sweep — faithful prettier-plugin-svelte layout for its
  gated shapes (svelte-maplibre radio labels).

Restoring `collapse.rs` to its pre-#1505 state returns the formatter to the last
green parity state and re-fixes all 11 regressions. This intentionally reverts
#1505 in full: the passes cannot be separated at whole-pass granularity (each is
needed by a regression), so a partial keep would either leave regressions or
require new per-shape guards that belong to a dedicated formatter-layout change,
not a regression fix.

No compiler-output change; formatter output only.
