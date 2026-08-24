---
"@rsvelte/fmt": patch
---

Format a component whose source starts with a UTF-8 BOM. `parse` strips the BOM, so the spans it returns are relative to the stripped text, while the formatter kept slicing the unstripped source with them — three bytes off, which made `<script>`-bearing files fail with `script closing tag missing` and be left unformatted. The BOM is now stripped once at the entry point and restored in the output, as prettier does.
