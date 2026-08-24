---
'@rsvelte/compiler': patch
---

Measure a sequence item the way esrap does, so the 60-column wrap agrees

Two offsets, in opposite directions, both in `Context::measure`:

* esrap writes a nested sequence's own inter-item space as a **string**, so its
  `measure` counts it. Here that space is a layout event and `measure` subtracts
  it, so a child that hides *k* spaces is measured *k* short. `sequence_indexed`
  now uses `measure_with_layout_spaces`, the accessor the variable-declaration
  layout one printer over was already using for exactly this.
* esrap measures a JS string, so a character costs its **UTF-16** length; the
  buffer here is a Rust `String`, so it cost its UTF-8 byte length — up to 4 for
  one character, 6 for an emoji with a variation selector. `write` now
  accumulates the excess and `measure` subtracts it.

Neither changes what the code does, only where esrap breaks a line — which is
also why no gate could see it: every corpus comparison normalizes with oxfmt, and
oxfmt reflows exactly this. Verified directly: on a 143-line output a raw byte
comparison reports the divergence and the post-oxfmt comparison reports identical.

Grids. Space offset — 6 child kinds × item counts 2–24 = 138 cells: **4 → 0**, one
diverging count per kind, with a zero-inner-space child (`0`, `1`, `2`, …) at 0
throughout as the negative control. UTF-16 offset — 5 character widths × counts
2–20 × 2 targets = 190 cells: **2 → 0**, and ASCII at 0 throughout.

The two are coupled and the order matters: fixing the space offset alone took the
UTF-16 grid from 2 to **4**, because the byte over-count had been partly cancelling
the space under-count. That is the measurement that says these are one commit.

Whole-population control, since a wrap rule is global — a **raw byte** sweep (no
oxfmt) over the 1,913 real components of bits-ui and flowbite-svelte, client and
server, 3,826 compared units: **108 → 76 diverging, 32 fixed, 0 introduced**, by
set difference rather than by count.

What this does **not** fully reach: a comment in the script sends the sequence
down the non-direct layout branch. 6 comment slots × the 4 child kinds × 2 targets
= 48 cells goes **42 → 7**, and all 7 residual cells are the single tightest kind
(a 7-item array of two-argument calls, whose accumulator lands one over the
threshold), so that branch is still short by 1 somewhere. It is tracked as #3715; the repro here therefore carries its explanations as markup comments
rather than JS ones, so that what it pins is this fix and not that residue.
