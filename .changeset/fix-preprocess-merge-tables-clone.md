---
"@rsvelte/compiler": patch
---

fix(preprocess): defer the sources/names table clone in sourcemap concat until an entry is actually new

`MappedCode::concat`'s `merge_tables` helper unconditionally cloned the entire
`this_table` slice (`self.map.sources` / `self.map.names`) up front via
`this_table.to_vec()`, before checking whether any entry from `other_table` was
actually missing. In the common case — every `other_table` entry already
present — the caller discards the returned table anyway (it only assigns it
back when `changed` is `true`), so the clone was wasted work on every
`concat()` call, which runs once per stitched-together `MappedCode` chunk while
building a preprocessed file's source map.

`merge_tables` now only materializes the merged table (via
`Option::get_or_insert_with`) the first time an entry is found missing, and
returns an empty `Vec` (never read by the caller) when nothing changed. Output
is unchanged — this only affects the discarded-on-no-op allocation.
