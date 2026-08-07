---
"@rsvelte/compiler": patch
---

Answer the identifier-boundary question without a regex

`body_references_identifier` compiled-and-cached one boundary regex per reactive
variable and then ran it over the stripped statement body, once per (`$:`
statement × variable) pair. The pattern only ever asked three things — is the
byte after the name an identifier byte, is the byte before one, and is a leading
`.` a member access or the tail of a spread — so a matcher that asks them
directly replaces it. Overlapping occurrences stay reachable because the scan
advances by one byte, not by the match length.

On carbon-components-svelte this regex was 70% of the remaining time in
`extract_reactive_statement_deps`; its share of total compile time drops from
19.6% to 6.0%.
