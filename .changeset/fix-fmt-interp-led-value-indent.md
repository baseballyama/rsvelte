---
"@rsvelte/fmt": patch
---

fix(formatter): don't double-indent interpolation-led attribute value continuations

The whole-value attribute Doc model baked the absolute attribute indent into
continuation lines, but the open-tag assembly re-indents interpolation-led
values (`value="{…}"`) a second time — text-led values (`class="text {…}"`) are
kept verbatim — so a wrapped interpolation's continuation landed at double the
intended column. The model's base indent now matches that split: absolute for
text-led (verbatim) values, relative for interpolation-led (re-indented) ones.
Break-point selection is unchanged.
