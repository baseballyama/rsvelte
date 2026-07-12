---
"@rsvelte/compiler": patch
---

fix(parse): harden parser against panics and infinite loops on edge-case input

`strip_type_annotation` now slices on byte offsets (`{const café: T = e}` no
longer panics), the CSS rule loop has a progress guard so `<style>{}</style>`
reports `css_expected_identifier` like the official compiler instead of hanging,
and selector identifiers accept code points >= 160 (matching the official
compiler's treatment of e.g. `×` as a valid type selector).
