# rsvelte Learn site

The pipeline playground builds `crates/rsvelte_kernel_browser` and runs the actual Svelte,
Vue, and Vue-syntax/Svelte-compiler plugins in the browser. It shows task outputs,
artifact computation and cache access, and snapshots of the parsed trees and analysis.
Tasks use the same registry and scheduler as native runs, without browser threads.
Type checking needs an external TypeScript process and is not offered here.

The document printer experiment remains at `/learn/playground/doc`.

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
