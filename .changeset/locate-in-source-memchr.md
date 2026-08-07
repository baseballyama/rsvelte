---
"@rsvelte/compiler": patch
---

Locate dev-mode source positions without walking the whole prefix

`locate_in_source` counted lines and UTF-16 columns by iterating every
character from byte 0. Dev-mode codegen calls it once per instrumented site, so
the walk was quadratic in the source length. It now counts newlines with
`memchr` and only walks the final line for the column.

Interleaved paired runs, dev-mode client: open-webui −12.9% (8/8),
SMUI −4.1% (8/8), carbon-components-svelte −4.0% (7/8), Huly plugins −4.0%
(6/6). Production-mode client is unchanged (−0.9%, 2/6).
