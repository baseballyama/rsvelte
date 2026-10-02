# Crates

| Path | Responsibility |
|---|---|
| `kernel/` | Sources, positions, diagnostics, output, metrics, and task scheduling |
| `languages/<language>/core/` | Shared language data and artifact registration; Svelte uses the crates below |
| `languages/svelte/syntax/` | Source AST and token types |
| `languages/svelte/parser/` | Source parsing into the AST |
| `languages/svelte/hir/` | Shared template HIR and frontend builder |
| `languages/svelte/semantic/` | Name resolution, binding facts, and component analysis |
| `languages/svelte/core/` | AST to HIR normalization, artifact registration, and public re-exports |
| `languages/<language>/compile/` | Lowering, emission, and compile tasks |
| `languages/<language>/lint/` | Rules and lint tasks |
| `languages/<language>/format/` | Formatting and format tasks |
| `languages/<language>/check/` | TypeScript projections and checker registration |
| `languages/vue/compile_svelte/` | Vue semantics compiled for the Svelte runtime |
| `languages/svelte/compile_vue/` | Svelte semantics compiled for the Vue runtime |
| `hosts/command_line/` | CLI and integration examples |
| `hosts/browser/` | Browser bindings |
| `fixture_test/` | The snapshot harness for each crate's `tests/fixtures/` |

TypeScript core also parses JavaScript. CSS and HTML contain the tools implemented today;
there are no empty crates for tools that do not exist yet.

Svelte parser depends on syntax. HIR depends on syntax types, not the parser. Semantic analysis
depends on HIR, not the parser or core. Core connects these crates and keeps the shared artifact
cache. JavaScript scope analysis stays in TypeScript core.

Core crates never depend on tool crates. Tools depend on core and read facts through the
kernel's `DocumentContext`. Each tool's `register` adds its required artifacts and its task.
Artifact registration is idempotent, so tools share parsing and analysis on one document.

Hosts choose tools explicitly. For example, a formatter-only Svelte host calls
`rsvelte_svelte_format::register(&mut registry)`. A replacement implements the kernel's
`Task` trait and registers the core artifacts with `rsvelte_svelte::register`. Register
one implementation for each task identifier. The same interface works for other languages.

Inside each crate, keep the entry point, task adapter, and implementation separate. Split
implementation modules by responsibility. Shared language facts belong in core, not in a
copy inside each tool. Check file limits with `mise run structure`.
