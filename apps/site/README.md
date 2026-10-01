# rsvelte Learn site

The document playground builds `crates/rsv_kernel_wasm` and runs the Rust kernel's
document builders, printer, display width calculation, and layout trace in the browser.

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
build. The Doc widget initializes Wasm on mount and shows loading or initialization
errors without invoking the printer during server rendering.
