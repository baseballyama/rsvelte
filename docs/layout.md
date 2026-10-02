# Source layout

The workspace separates shared data, hosts, languages, and task capabilities.

| Path | Owns |
|---|---|
| `crates/kernel` | Shared source data, computation, diagnostics, and output |
| `crates/hosts/command_line` | CLI and integration tests |
| `crates/hosts/browser` | Browser bindings |
| `crates/languages/<language>/core` | Source trees, semantic facts, and shared transforms |
| `crates/languages/<language>/{compile,format,lint,check}` | Task implementations and registration |
| `crates/languages/vue/compile_svelte` | Vue to Svelte translation |
| `crates/languages/svelte/compile_vue` | Svelte to Vue translation |

Core and translation crates use layers like the kernel and the Svelte core.
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

## File length

Run `mise run structure`. `mise run lint` and CI run the same check.
The limit is configured in `tools/structure/limits.json`.
The check includes tracked files and new files that Git does not ignore. Deleted
files are not counted.

It measures Rust, TypeScript, JavaScript, component, and stylesheet files in `crates/`,
`tools/`, and `apps/`, including tests. Vendor declarations, generated Wasm
bindings, and deliberately wrong fixture inputs are not measured. The fixture
corpus and oracle snapshots are not application source.

The existing long files in the two reference crates have individual limits and
reasons. They cannot grow beyond those limits. Remove an exception once its file
fits the default limit. Missing files and an empty measured population fail.
