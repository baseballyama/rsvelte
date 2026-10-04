# Native TypeScript content mapper

This crate implements the external content mapper protocol used by native TypeScript 7.1.
It has no language parser and no type checker.

| API | Use |
|---|---|
| `serve(diagnostic_source, transform)` | Serve JSON-RPC over stdin/stdout; the callback writes one transform result |
| `write_mappings(mappings, output)` | Write copied byte ranges as native verbatim span tuples |
| `serve_precomputed()` | Serve saved projections without parsing their original inputs again |

The protocol uses UTF-8 byte positions. Native TypeScript converts positions for its API
and editor features. Synthesized gaps have no original range. Point mappings are omitted.
JSON input is decoded into typed records; output uses the kernel's streaming writer.

`rsvelte-typescript-content-mapper` serves precomputed projections. For `input.ext`, it reads
`input.ext.projection.json`: `source`, `text`, and `mappings`. Each tuple is
`[virtualStart, virtualLength, originalStart, originalLength, kind]`.
The original content must equal `source`. Native TypeScript validates ranges and verbatim text.

```sh
cargo install --path crates/languages/typescript/content_mapper
```

The mapper package declares `typescript.contentMapper.exec` in its `package.json`.
The project selects that package and its input extensions through top-level `contentMappers`.
Native TypeScript requires `--runExternalCode` for CLI use, or `runExternalCode: true`
for its native API. The fixture tools pin `7.1.0-dev.20261003.1`.
