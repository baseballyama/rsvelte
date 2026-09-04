---
'rsvelte': patch
---

The publish decision skipped the Marketplace on an inference with two producers.

`mpAbsent && ovsxAtOrAhead` — an empty gallery beside an Open VSX copy at or
ahead of the target — was documented as "a contradiction only one state
produces: the Marketplace copy is unlisted while its name stays reserved."

Measured on run 33888597354: a single publish put 0.7.0 on Open VSX (six targets,
all accepted) and was rejected by the Marketplace for its **display name**. That
leaves exactly the same pair. So the state after any partially-successful publish
is indistinguishable from the one the guard was written for, and the guard then
skips every retry at that version — which is what happened on `63e8e025b`, where
the display-name fix could not be attempted because the previous run had put
0.7.0 on Open VSX.

The Marketplace decision is now a function of the Marketplace state alone: an
empty gallery is published into and `vsce` gives the verdict. A failed attempt is
a red job with a diagnostic; the skip it replaces was neither success nor failure
and reported nothing.
