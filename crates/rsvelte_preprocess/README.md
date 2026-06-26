# rsvelte_preprocess

Native Rust ports of the [awesome-svelte preprocessors][awesome] as rsvelte
`PreprocessorGroup`s that plug into the `rsvelte_core` preprocess engine
(`rsvelte_core::compiler::preprocess::preprocess`).

> **Status — Rust-only today.** These are consumable from Rust (the builder
> functions below). There is **not yet** an `@rsvelte/*` npm package or
> N-API/WASM binding, so they **cannot be dropped into a `svelte.config.js`**
> yet. See [Using from JavaScript](#using-from-javascript-not-yet) for the gap
> and the planned path.

## Ports

| Preprocessor | Builder | Backend |
|---|---|---|
| svelte-switch-case | `switch_case()` | **Native** (markup `{#switch}` → `{#if}`) |
| svelte-preprocess-sass | `sass::sass(opts, filter)` | **Native** (`grass`) |
| svelte-preprocess-less | `less::less(opts, filter)` | **Native** (variables + flat rules) → bridge fallback |
| svelte-preprocess (auto) | `svelte_preprocess::svelte_preprocess(opts)` | **Native subset** (replace, globalStyle, scss/sass) |
| @modular-css/svelte | `modular_css::modular_css(cfg)` | **Native** `<style type=text/m-css>` → bridge for `<link>`/`<script import>` |
| mdsvex | `mdsvex::mdsvex(cfg)` | **JS bridge** (Node → `mdsvex`) |
| svelte-preprocess-markdown | `markdown::markdown(cfg)` | **JS bridge** (Node → `marked`) |
| @nvl/sveltex | `sveltex::sveltex(cfg)` | **JS bridge** (Node → `@nvl/sveltex`) |

Each port is verified against its upstream package's own fixtures; see the
matching file under `tests/`.

**Native vs. JS bridge.** Where a faithful pure-Rust backend exists, the
transform runs entirely in Rust. The markdown family (mdsvex / markdown /
sveltex) defines its output via specific JS engines (`marked`, `unified`/remark,
KaTeX) with no byte-equivalent Rust backend, so those delegate to the user's
installed tool over a Node bridge (`node` must be on `PATH` and the tool
installed in the project). This is the plan's sanctioned fallback
(`docs/preprocessor-port-plan.md` §2.2).

## Using from Rust

```rust
use rsvelte_core::compiler::preprocess::preprocess;
use rsvelte_preprocess::{
    switch_case,
    svelte_preprocess::{svelte_preprocess, AutoOptions},
    sass::sass,
    filter::FilterOptions,
};

# async fn run(source: String) -> Result<(), Box<dyn std::error::Error>> {
let processed = preprocess(
    source,
    vec![
        switch_case(),
        sass(Default::default(), FilterOptions::default()),
        svelte_preprocess(AutoOptions::default()),
    ],
    Some("src/App.svelte".to_string()),
)
.await?;

println!("{}", processed.code);
# Ok(())
# }
```

`preprocess(...)` runs each group's markup → script → style hooks in order, the
same contract as `svelte.preprocess(...)`.

### Cargo features

All ports are on by default. Disable what you don't need:

```toml
rsvelte_preprocess = { path = "…", default-features = false, features = ["sass", "svelte-preprocess"] }
```

`sass`, `less`, `svelte-preprocess`, `mdsvex`, `modular-css`, `markdown`,
`sveltex` (`switch-case` is always available). The bridge ports require `node`
at runtime; configure module resolution / the node binary via the
`MarkupBridge` / `BridgeOptions` / `LessOptions` structs.

## Using from JavaScript (not yet)

To make these drop-in replacements in a real Svelte project's
`svelte.config.js`, two pieces are still missing:

1. **N-API binding** (like `apps/npm/vite-plugin-svelte`'s native shim) exposing
   `preprocess(source, groups, filename)` + the builder options to Node.
2. **`@rsvelte/*` npm package(s)** wrapping that binding so users can
   `import { switchCase } from '@rsvelte/preprocess-switch-case'` and add it to
   the `preprocess` array.

Until then the only consumer is Rust. The intended end-state mirrors the other
shipped ecosystem packages under `apps/npm/`.

[awesome]: https://github.com/TheComputerM/awesome-svelte#preprocessing
