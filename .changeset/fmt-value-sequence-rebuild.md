---
"@rsvelte/fmt": patch
"@rsvelte/language-server": patch
---

fmt: lay out a wrapped attribute value's interpolations at the indent they print at

A quoted attribute value with several `{…}` interpolations had each broken
interpolation shaped on the room its first line had, and that shape was kept
for continuation lines that had the whole width — `parentRowId === row.id`
split at `===` on its own line, `{session?.user?.email}` split at every `?.`.
Each interpolation is now rebuilt at the attribute's real indent when it
prints, measured up to its first break opportunity, and the closing `"` is
charged only where prettier charges it.
