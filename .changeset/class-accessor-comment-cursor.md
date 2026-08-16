---
"@rsvelte/compiler": patch
---

Drop the comments upstream loses when it lowers a public rune class field: the generated `get`/`set` bodies carry no `loc`, which parks esrap's comment cursor past the end of the file until a located body re-syncs it, so every comment in between is missing from official's client output. rsvelte built those accessors as source text and kept the comments.
