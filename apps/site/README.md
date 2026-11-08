# rsvelte site

The rsvelte site, a SvelteKit app for Cloudflare Workers, introduces the project and explains
the toolchain. Contributors use this directory to edit pages and run the site locally.

| Route                   | Purpose                                                     |
| ----------------------- | ----------------------------------------------------------- |
| `/`                     | Project introduction                                        |
| `/why`                  | Reasons for the rewrite                                     |
| `/guide`                | User guide: setup, file processing, and browser integration |
| `/learn`                | Developer guide with source excerpts                        |
| `/learn/playground`     | Run language tasks and inspect the pipeline                 |
| `/learn/playground/doc` | Try the document printer and inspect layout decisions       |

## Relationship to the toolchain

`apps/site` has the pages and interactive controls.
[`crates/hosts/browser`](../../crates/hosts/README.md#browser--webassembly) has the
WebAssembly bindings those controls call. The language crates and the kernel do the work. The
site does not call the native command-line host; both hosts use the same toolchain.

The pipeline playground builds `crates/hosts/browser` and runs the real Svelte, Vue and
Vue-syntax/Svelte-compiler plugins in the browser. It shows task outputs, artifact computation
and cache access, and snapshots of the parsed trees and analysis. Tasks use the same registry
and scheduler as native runs, without browser threads. Type checking needs an external
TypeScript process, so the playground does not offer it.

## Local development

Use the repository's pinned Rust toolchain, the Node and pnpm versions in `mise.toml`, and
wasm-pack 0.15.1. The site is one package of the repository's pnpm workspace, so install from
the root:

```sh
rustup target add wasm32-unknown-unknown
cargo install wasm-pack --version 0.15.1 --locked
pnpm install --frozen-lockfile
pnpm --dir apps/site run dev
```

`dev`, `test`, `check`, `build` and `deploy` first run `pnpm run generate`. It writes to
`generated/`, which Git ignores, everything the site reads but does not commit. That is the
Wasm bindings, and the emitter and layer data that the `rsvelte_command_line` examples print.
Vite includes the `.wasm` asset in the client build. The LayoutInstruction widget initializes
Wasm on mount. It shows loading or initialization errors, and it does not call the printer
during server rendering.
