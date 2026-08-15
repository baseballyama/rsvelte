---
"@rsvelte/compiler": patch
---

Compose the source maps of every preprocessor in the chain, consume an attached `//# sourceMappingURL` comment, and count map columns in UTF-16 code units. Also fixes the VLQ sign encoding, which made every negative delta in a preprocess map one too small.
