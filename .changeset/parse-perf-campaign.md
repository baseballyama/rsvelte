---
"@rsvelte/compiler": patch
---

perf(parse): 2.4x faster template parsing (CI benchmark: 60.5x → 175x vs `svelte/compiler`)

Eight output-identical optimizations: typed `{@const}`/destructuring/binding-pattern
builders replace every serde_json round-trip on the parse path, `<script>` bodies and
block-head / attribute / directive expressions defer their JS parse under
`defer_script_parse`, `Expression` shrinks from 216 to 16 bytes (EachBlock 976→376,
Attribute 488→288), `ParseArena` stores nodes in chunks, and the quoted-attribute
scanner uses memchr. AST output is byte-identical across the full Svelte test corpus
and 4011 real-world components in both eager and deferred modes.
