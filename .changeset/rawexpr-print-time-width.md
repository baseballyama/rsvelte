---
"@rsvelte/fmt": patch
"@rsvelte/language-server": patch
---

A broken interpolation's line breaks are chosen at the column it prints at, not at column 0.

`Doc::RawExpr` carries a pre-formatted expression whose broken form was built before the
printer knew the indent, so an interpolation nested six elements deep was broken at the same
width as one at the top level and overflowed the print width. The variant now carries the
expression source, and the printer rebuilds the broken lines against `width - indent`.

The build-time shape is the same call with no budget, so it is unchanged and stays as the
fallback for a rebuild that fails. `fits` still measures the build-time first line: it has no
indent to rebuild against, and giving it one would move the measurement as well as the print.
