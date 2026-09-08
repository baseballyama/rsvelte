---
'@rsvelte/language-server': patch
---

fix(language-server): find a document opened through a symlink

`DocumentStore` is keyed on the URI string the client sent, and several
responses are post-processed by looking the document up with a URI the server
derived from the overlay's *resolved* path. When the two differ — a workspace
under macOS's `/var`, which is a symlink to `/private/var`, is enough — every
one of those lookups misses and the post-processing is silently skipped.

The store now also indexes each open document by its resolved path and consults
that only after a direct hit fails, so the common request costs no extra
syscall and a response still names the URI the client itself opened.

Measured on the hover quote-widening, the loss this was found through: with a
symlinked workspace the probe scored 2/11 EQ against 6/11 on the realpathed one;
with the fix the two workspaces are identical cell for cell.
