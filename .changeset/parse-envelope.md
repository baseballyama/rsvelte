---
"@rsvelte/vite-plugin-svelte-native": minor
---

Add `parse(source, options?)` and `parseEnvelope(source, options?)` NAPI
exports. `parse` returns the AST as a JSON string (the cross-NAPI
analogue of the wasm-exposed `parse_svelte`); `parseEnvelope` returns a
raw-transfer `Buffer` in a new binary format documented in
`src/napi_raw_parse.rs` — pair it with `decodeParseEnvelope` exported
from `@rsvelte/vite-plugin-svelte-native/parse-envelope.js` to skip
`JSON.parse` on the JS side.

Every template node, attribute, directive, block, `Script`, `JsComment`,
`SourceLocation`, and all 74 `JsNode` (estree) variants get dedicated
binary tags. `StyleSheet`, `SvelteOptions`, and directive `metadata`
remain inline JSON behind `TAG_JSON` for now.

`NapiParseOptions { skipExpressionLoc?: boolean }` mirrors the existing
`ParseOptions::skip_expression_loc`; when set, the envelope flags the
JS decoder to skip the per-`JsNode` loc bytes.
