# Native TypeScript content mapper

This crate implements the external content mapper protocol used by native TypeScript 7.1.
It has no language parser and no type checker.

| API                                   | Use                                                                                                                                                  |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `serve(diagnostic_source, transform)` | Serve JSON-RPC over stdin/stdout; the callback gets the file and its project's `options`, writes one result, and its error answers only that request |
| `write_mappings(mappings, output)`    | Write copied byte ranges as native verbatim span tuples                                                                                              |
| `serve_precomputed()`                 | Serve saved projections without parsing their original inputs again                                                                                  |

The protocol uses UTF-8 byte positions. Native TypeScript converts positions for its API
and editor features. Synthesized gaps have no original range, and the mapper writes no point
mappings. It decodes JSON input into typed records and writes output with the kernel's streaming
writer.

`rsvelte-typescript-content-mapper` serves precomputed projections. The project's
`contentMappers[].options.projections` names one store file. Its `files` object holds a
projection for each filename the checker reads: `source`, `text`, `extension` (the virtual
one, such as `.ts`) and `mappings`. Each tuple is
`[virtualStart, virtualLength, originalStart, originalLength, kind]`. The mapper reads a store
once for each distinct `options`, so a host that rewrites a store also changes another option.
The original content must equal `source`. Native TypeScript removes a leading byte order mark
before it sends the content, so `source` and the mappings count from after it. Native TypeScript
validates ranges and verbatim text, and stops using a mapper after five failed transforms.

```sh
cargo install --path crates/languages/typescript/content_mapper
```

The mapper package declares `typescript.contentMapper.exec` in its `package.json`.
The project selects that package and its input extensions through top-level `contentMappers`.
Native TypeScript requires `--runExternalCode` for CLI use, or `runExternalCode: true`
for its native API. The fixture tools pin `7.1.0-dev.20261102.1`.
