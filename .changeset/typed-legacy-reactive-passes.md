---
"@rsvelte/compiler": patch
---

Answer the legacy `$:` analysis from the typed AST instead of serializing the instance script

The three legacy reactive passes — cycle detection, `legacy_dependencies` population
and per-statement dependency collection — read their input as `serde_json::Value`, so
every top-level `$:` statement was serialized with `JsNode::to_value()` first. That one
producer built **77-82% of all the JSON objects and map entries the compiler allocates**
on Svelte-4-era code, and with `serde_json`'s `preserve_order` feature each map entry is
a key `String` allocation and a hash insert.

All three passes and their walkers now traverse typed nodes, and the serializer is gone.
On a 3,509-file application corpus that removes 100,535 JSON objects and 501,609 map
entries, with byte-identical output and warnings across client, server and dev.
Components without `$:` are unaffected by construction.
