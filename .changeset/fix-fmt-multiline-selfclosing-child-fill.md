---
"@rsvelte/fmt": patch
---

fix(fmt): break a children fill when a self-closing element child is multi-line

A non-block element (e.g. `<label>`) containing a self-closing element whose
attributes wrapped (`<input … />`) followed by another element kept the two on one
line (`/> <span>…</span>`) where prettier breaks them onto separate lines — a
multi-line item in a fill forces its surrounding separators to break.

Two causes: (1) `element_doc` returned `None` for a self-closing `RegularElement`,
which made the whole `build_children_doc` bail, so `try_fill_mixed` skipped the
element entirely. A new `build_self_closing_regular_doc` builds a breakable
attribute group from the per-attribute spans (single-line even when the element
span already wrapped), guarded to round-trip the canonical `<tag a b c />`.
(2) `try_fill_mixed` only re-flowed non-prose content when a hardline survived the
flat render; it now also re-flows when any non-text child is already multi-line in
the output (`has_multiline_child`).

Burns down the fmt-parity corpus by 4 (75 known failures; layercake AxisY /
AxisYRight, CSR + SSR variants).
