---
"@rsvelte/vite-plugin-svelte-native": patch
---

fix(parse-envelope): remap typed-arrow `JsNode::Raw` offsets to UTF-16 (#908). A typed function parameter (`(r: number[]) => …`) is lowered to a `JsNode::Raw` JSON sub-tree, which the raw-transfer envelope encoder serialized verbatim — keeping its byte offsets while every other span was remapped to UTF-16. With non-ASCII source preceding the arrow, the whole arrow (params **and** body) drifted by `byteLen − utf16Len`, so `decodeParseEnvelope` spans no longer matched `parse` (JSON) and `source.slice(node.start, node.end)` broke (`magic-string` out-of-bounds). The `JsNode::Raw` writer now applies the same `convert_positions_to_utf16` remap as `write_json_node`, so the envelope is fully UTF-16-consistent.
