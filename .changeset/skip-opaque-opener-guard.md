---
'@rsvelte/compiler': patch
'@rsvelte/vite-plugin-svelte-native': patch
---

`skip_opaque` is now guarded on its opener byte before being called. It answers
`None` for every byte outside `` ` ``, `'`, `"` and `/`, and is too large to
inline, so without the guard every ordinary byte of a script paid a call to be
told no. Client compile is 0.65% faster and server 1.91%, with output
byte-identical on the corpus.

The guard is four immediate compares rather than a 256-entry lookup table: the
table form measured 1.62% *slower* on the client, where the per-byte load costs
more than the branch saves, while being 2.41% faster on the server.
