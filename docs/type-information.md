# Shared type information

Type checking and typed lint use the same projection and the same native TypeScript Program.
The projection has no task mode. It includes the component's public props, instance exports,
and bindable keys, as well as expressions from its scripts and template.

| Layer | Owns |
|---|---|
| Svelte parser | Immutable source nodes and UTF-8 spans |
| `typescript_projection` | Immutable generated AST, emitted TS, content mappings |
| Project host | One native TS 7.1 snapshot per project revision and its real import graph |
| `ProjectTypeInfo` | Source node lookup, native type handles, cached diagnostics |
| Typecheck / typed lint | Their own findings from the shared Program and type facts |

The host gives both consumers the same `ProjectTypeInfo`. A rule queries the span of an
original AST node, with its matching native syntax kind. Spans at this API are UTF-8 bytes.
The adapter converts to native UTF-16 positions once per file and indexes mapped AST nodes.
It returns all exact source copies. It does not pick an arbitrary copy when lowering duplicates
an expression. Generated helpers have no original node and are excluded from source rules.
Rules and fixes walk the original Svelte and JS/TS trees; the generated tree only supplies types.

Native diagnostics already use original UTF-16 positions. Convert these positions to UTF-8;
do not map them through the projection again. A native virtual-location notice has no original
span. Missing mappings and error types stay explicit. A real source `any` remains `any`.
Printed type names are display text, not the type database.

Keep the adapter only for the lifetime of its snapshot. On an edit, changed dependency,
configuration, mapper, or helper declaration, create an adapter for the updated native Project.
Native TypeScript may reuse its own incremental work. Do not carry native type IDs or cached
facts across snapshots. Each cache is bounded by files and nodes in that immutable Program.
JavaScript diagnostic settings control reporting, not whether typed lint can request a projection.

The standalone [type information package](../tools/type-information/README.md) implements
this API. Native integration tests use one Program for diagnostics and typed lint queries and
check that repeated queries reuse the type handles without a second request.
The Rust `typescript.check` CLI backend still returns diagnostics only. Connecting Rust typed
lint requires a project host that exposes this shared service and a side table keyed by source
`NodeIdentifier`. That connection and typed lint rules are not implemented yet.
