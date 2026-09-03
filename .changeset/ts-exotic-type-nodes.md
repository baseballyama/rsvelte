---
'@rsvelte/compiler': patch
---

Seven `TSType` variants fell through `convert_ts_type`'s catch-all and serialized as a span-bearing `TSUnknownKeyword` stub, so `parse()` reported a conditional, infer, mapped, query, import, predicate or template-literal type as `unknown` and dropped the whole subtree under it
