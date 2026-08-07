---
"@rsvelte/lint": patch
---

fix(lint): walk `no-unused-props` usage scans by characters, not bytes

`member_chains` stepped its whitespace cursor one **byte** at a time, gated on
`(byte as char).is_whitespace()`. The UTF-8 continuation bytes `0x85` and `0xA0`
cast to `U+0085` NEL and `U+00A0` NBSP, both of which are whitespace, so any
character ending in one of them — `々` (E3 80 85), and a large slice of the CJK
and Cyrillic blocks through `0xA0` — let the cursor step into the middle of
itself. The next line sliced the source at that offset and panicked.

The `...` spread lookbehind on that same line was a second, independent panic:
`&source[p - 3..p]` slices three bytes back from a cursor that is already on a
boundary, which still lands inside any preceding 4-byte character (`𝕏foo.bar`
panicked on the *start* index even with the cursor bug fixed). It is now an
`ends_with`, which is boundary-safe by construction.

The four forward whitespace loops in `parse_member_chain` had the same byte
cursor. Those could not panic — a continuation byte never sits at a boundary a
forward scan can reach — but they failed to skip genuine Unicode whitespace, so
`props.\u{3000}foo` and `props\u{a0}['foo']` read as unused. Both now walk
characters.

Reachable from the public `no_unused_props::diagnostics_typed` (and
`rsvelte_lint_types::lint_component_types`), which need a type backend; the
syntactic path used by the `rsvelte-lint` CLI does not reach this code.
