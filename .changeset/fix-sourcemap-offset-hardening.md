---
"@rsvelte/compiler": patch
---

fix(preprocess): harden sourcemap decoding and warning offset handling

Malformed VLQ continuation runs no longer overflow-panic the decoder (shift is
bounded and running state uses wrapping adds), `process_markup` now decodes
standard VLQ-string v3 maps through `decode_map` instead of silently dropping
them, and `byte_offset_to_position` rewinds mid-codepoint offsets to the nearest
char boundary before slicing.
