---
"@rsvelte/compiler": patch
---

Emit `loc.character` on the nodes official emits it on. Official's `parse()` output carries positions from two producers that disagree about the field — `locate-character`'s locator returns `{line, column, character}`, acorn's `locations: true` returns `{line, column}` — and rsvelte had the two swapped in both directions: it added `character` to a script comment's `loc` in `Root.comments` (72 cases) and omitted it from the `Identifier` upstream builds with `Parser.read_identifier`, which is the `{@const}` pattern's id and an attribute shorthand's expression (320 cases). "Always emit it" and "never emit it" are therefore both wrong; the field now follows the producer. `Root.comments` stays the mixed array upstream builds — a comment inside a start tag keeps `character`, a comment in a `<script>` does not — so `JsComment` records which it is, and the parse envelope encodes it (format version 4 → 5).
