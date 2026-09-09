---
'@rsvelte/compiler': patch
---

repeat a speculated comment run whole, on the server as well as the client

acorn-typescript's `tsLookAhead` leaves `isLookahead` unset, so a comment inside
a `TSTypeLiteral`'s head fires `onComment` during the speculative parse and again
after the rewind. The rewind replays the whole run, so two comments print
`c d c d`; rsvelte repeated each comment in place (`c c d d`) and the server did
not repeat at all. The repeat now happens once, in the stripped script both
targets read, instead of in a client-only text pass.
