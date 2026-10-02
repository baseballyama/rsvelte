# rsvelte site

This is the rsvelte website, built with SvelteKit for Cloudflare Workers.
It introduces the project and explains the toolchain to readers and contributors.
Visitors use the site through their browser. Contributors use this directory to
edit pages and run the site locally.

| Route | Purpose |
|---|---|
| `/` | Project introduction |
| `/why` | Reasons for the rewrite |
| `/guide` | User guide: setup, file processing, and browser integration |
| `/learn` | Developer guide with source excerpts |
| `/learn/playground` | Run language tasks and inspect the pipeline |
| `/learn/playground/doc` | Try the document printer and inspect layout decisions |

## Relationship to the toolchain

`apps/site` provides pages and interactive controls.
[`crates/hosts/browser`](../../crates/hosts/README.md#browser--webassembly)
provides the WebAssembly bindings those controls call. The language crates and
kernel perform the actual work. The site does not invoke the native command-line
host; both hosts use the same underlying toolchain.

The pipeline playground builds `crates/hosts/browser` and runs the actual Svelte,
Vue, and Vue-syntax/Svelte-compiler plugins in the browser. It shows task outputs,
artifact computation and cache access, and snapshots of the parsed trees and analysis.
Tasks use the same registry and scheduler as native runs, without browser threads.
Type checking needs an external TypeScript process and is not offered here.

## Local development

Use the repository's pinned Rust toolchain, Node 26+, pnpm 10, and wasm-pack 0.14.0:

```sh
rustup target add wasm32-unknown-unknown
cargo install wasm-pack --version 0.14.0 --locked
cd apps/site
pnpm install --frozen-lockfile
pnpm run dev
```

`dev`, `test`, `check`, `build`, and `deploy` generate the Wasm bindings first.
`pnpm run build:wasm` also builds them independently. Generated files under
`src/lib/wasm/` are ignored by Git; Vite includes the `.wasm` asset in the client
build. The LayoutInstruction widget initializes Wasm on mount and shows loading or initialization
errors without invoking the printer during server rendering.
