---
'@rsvelte/compiler': patch
---

fix(sourcemap): a comment-buffer region records its own `LocRange`

`open_source_region_parts` and `open_island_region` append a verbatim slice of
the source to the comment buffer and returned spans inside it without recording
the region. `map_position`'s `loc_map` lookup then missed, fell through
`None => offset`, and resolved a comment-space offset against the source line
table — so segments landed past the end of the line they named. Both regions map
back linearly, which is one `LocRange` each.
