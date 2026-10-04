# Source layout

The workspace separates shared data, hosts, languages, and task capabilities.

| Path | Owns |
|---|---|
| `crates/kernel` | Shared source data, computation, diagnostics, and output |
| `crates/tooling/<task>` | Shared contracts and output specific to a task |
| `crates/fixture_test` | The snapshot harness for each crate's `tests/fixtures/` |
| `crates/hosts/command_line` | CLI and integration tests |
| `crates/hosts/config` | Setting loaders and runtime/native function adapters |
| `crates/hosts/browser` | Browser bindings |
| `crates/languages/<language>/core` | Shared language data and artifact registration |
| `crates/languages/svelte/{syntax,parser,hir,semantic}` | Source AST, parsing, shared HIR, and semantic facts |
| `crates/languages/<language>/{compile,format,lint,lint_typed,check,typecheck}` | Task implementations and registration |
| `crates/languages/svelte/typescript_projection` | Svelte to TypeScript projection AST and emission |
| `crates/languages/vue/compile_svelte` | Vue to Svelte translation |
| `crates/languages/svelte/compile_vapor` | Svelte to Vue Vapor translation |

See [crates/README.md](../crates/README.md) for Svelte crate dependencies and the normalization boundary.

Core, shared language, and translation crates use layers like the kernel.
A layer has a `name.rs` entry and a `name/` directory for its parts.

| Layer | Owns |
|---|---|
| `syntax` | Lexers, parsers, source trees, and operators |
| `semantic` | Scope and binding facts, selector matching |
| `compilation` | Tree copies, translations, style scoping, and code generation |
| `tooling` | Formatting, linting, type checking, and TypeScript projections |
| `computation` | Kernel artifacts, task registration, and task execution |

Only add layers a crate needs. `rsvelte_markup` has one shared rule and keeps it
in `button_type.rs`. The CLI uses `input`, `commands`, and `output`. Browser
bindings use `document` for layout rendering and `computation` for language tasks.

Split large implementations by responsibility. For example, a template builder
has separate files for blocks, elements, attributes, bindings, and expressions.
Keep shared state in the parent module. Keep implementation modules private.
Use the narrowest visibility that lets sibling modules share methods.
Task APIs belong to their capability crates. Core APIs remain in the core crate.

## Task boundary

The kernel treats task identifiers as opaque names. A `Task` reads a
`DocumentContext` and writes a `TaskOutput`: files, diagnostics, or both.
Diagnostic codes are independent of task identifiers. The kernel does not select
lint rules, enforce rule codes, or define task report formats.

Shared source trees and facts are borrowed. A transform builds a separate tree;
register it as an artifact if other tasks need it. Output text is a final result,
not input for another transform. Language trees and facts stay in language crates.
Generic layout instructions belong in the kernel; language formatting choices do not.

`tooling/lint` owns rule execution, stable finding order, and ESLint report output.
Language lint crates supply the rule contexts and implementations. Rules live in
`src/rules/<rule>.rs`; syntax and scope rules use `lint`, and type-aware rules use
`lint_typed`. Hosts select
and register tasks; the kernel runs them on one worker per document.

## Plugin dependencies

Each registration crate exposes a static `PLUGIN` declaration: an opaque identifier,
its SemVer version, and dependency identifiers with Cargo-style SemVer requirements.
For example:

```rust
use rsvelte_kernel::computation::plugins::{Dependency, Plugin};

pub static PLUGIN: Plugin = Plugin {
    identifier: "example.lint.typed",
    version: "1.0.0",
    dependencies: &[Dependency {
        identifier: "example.types",
        requirement: "^2.1",
    }],
};
```

Register it with `Registry::plugin(&PLUGIN)`. Names identify plugins, not tasks or
lint rules. The kernel allows one version per name. Repeating the same declaration
is a no-op; conflicting declarations are errors. Built-in plugins use their crate
version and require the exact version of their workspace dependencies.

`Registry::validate_plugins()` checks all registered plugins. `run` and `run_each`
also check before any task, document selection, provider or sink runs. Missing
plugins, incompatible versions, invalid metadata, duplicate dependencies and
cycles return errors. Validation is cached until a declaration changes.

Registration functions add their built-in dependencies without enabling their
tasks. Hosts load external dependencies before validation; the kernel does not
install plugins or start external services. Plugin versions are independent of
external executable versions, which their service provider validates.

## File length

Run `mise run structure`. `mise run lint` and CI run the same check.
The limit is configured in `tools/structure/limits.json`.
The check includes tracked files and new files that Git does not ignore. Deleted
files are not counted.

It measures Rust, TypeScript, JavaScript, component, and stylesheet files in `crates/`,
`tools/`, and `apps/`, including tests. Vendor declarations, generated Wasm
bindings, deliberately wrong fixture inputs, and crate fixture cases
(`crates/**/tests/fixtures/`) are not measured. The fixture
corpus and oracle snapshots are not application source.

The existing long files in the two reference crates have individual limits and
reasons. They cannot grow beyond those limits. Remove an exception once its file
fits the default limit. Missing files and an empty measured population fail.
