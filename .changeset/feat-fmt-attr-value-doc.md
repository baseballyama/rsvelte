---
"@rsvelte/fmt": patch
---

fix(formatter): measure multi-interpolation attribute values as one Doc

A quoted attribute value with two or more `{…}` interpolations was measured
per-interpolation, with trailing interpolations counted as zero width — so the
wrong interpolation broke, or none did. The whole value is now built as a single
measured Doc: literal text verbatim (prettier gives attribute text no break
points), each interpolation a group embedding its oxc-formatted flat and broken
forms.

Break-point selection follows prettier's fits semantics rather than a bespoke
rule: a breakable trailing interpolation, measured in break mode, charges only
the width up to its first internal break point and then short-circuits the
measurement. Prettier's greedy layout — keep an earlier interpolation flat
whenever a later one can break to absorb the overflow — emerges from that
composition. The mode branch is pinned by unit tests: at the same width,
flipping only a trailing interpolation's breakability flips the leading
interpolation between flat and broken.

Values stay on the previous path when the interpolation is deep (object /
call-argument expansion), the text spans multiple source lines, or the value is
a `style:` directive (whose text is a real fill, unlike regular attributes).
