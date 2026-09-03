---
'@rsvelte/compiler': patch
---

Search for a single ASCII byte with `memchr` rather than `CharSearcher`

`str::find`/`contains` with a `char` needle routes through `CharSearcher`, which
a profile puts at 2.37% of a client compile — the same shape as the `StrSearcher`
setup cost `find_sub` already avoids. 212 single-ASCII-char call sites now take
`find_byte`/`has_byte`, and the 43 remaining string-literal needles outside
`3_transform/{client,shared}` take `find_sub`/`has_sub`. Offsets are unchanged:
a byte-level match of valid UTF-8 cannot land inside a multi-byte sequence.
