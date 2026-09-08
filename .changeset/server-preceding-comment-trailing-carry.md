---
'@rsvelte/compiler': patch
---

fix(server): a comment preceding a legacy prop declaration no longer collapses its trailing one

On the server a trailing comment on a legacy prop default is kept inside the
`$.fallback(...)` call, unless some comment preceded the declaration — then both
collapsed onto the statement's own address. Two separate causes: the carry's guard
was spelled from the region's start, so it was denied for a comment merely
*preceding* the statement when only one *inside* the declaration needs the
collapsed form; and the rebuilt, location-less statement was anchored at the head
of the region, which leaves every comment in it to flush at the declarator. That
anchor is right for a split declaration — upstream prints `let // pre` + `a = …`
there — and wrong for a single declarator, which now keeps the keyword's own
position.
