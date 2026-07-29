# rsvelte_core

`rsvelte_core` is the low-level compiler implementation behind
[rsvelte](https://github.com/baseballyama/rsvelte), an independent
implementation of the Svelte compiler.

> [!IMPORTANT]
> rsvelte is not affiliated with or endorsed by the Svelte project.

Most embedders should depend on the higher-level
[`rsvelte`](https://docs.rs/rsvelte) facade. It exposes owned,
compiler-neutral artifacts and keeps this crate's AST, OXC types, compiler
phases, and backend errors out of the host's public dependency boundary.

## Scope

This crate contains the in-process parser, analyzer, code generator, compiler
AST, and low-level preparation API shared by rsvelte products. The host still
owns filesystems, caches, scheduling, and worker pools.

Command-line tools, filesystem watching and resolution, JavaScript/Wasm
bindings, allocators, profiling tools, and benchmarks belong to dedicated
packages rather than this crate.

The low-level compiler model is a pre-1.0 API and may change between minor
releases. Use the `rsvelte` facade when long-lived cache and artifact schemas
are part of your integration contract.

Low-level function-valued options remain caller policy. In particular,
stateful warning filters can make repeated prepared-component emissions
non-deterministic. Persistent-cache integrations should use pure callbacks
with caller-owned identities or the stable facade, which returns diagnostics
for filtering after compilation.

## Features

The default feature set is intentionally empty. `parallel` enables the
explicit batch/parallel compiler entry points. `wasm-target` selects the
JavaScript entropy backend when this library is linked into a Wasm binding
crate; it does not export bindings itself.

Feature removal or moving an API behind a feature is treated as a compatibility
change. The supported features for each release are documented on
[docs.rs](https://docs.rs/rsvelte_core).

## Compatibility and MSRV

- Minimum supported Rust version: **1.95**
- Svelte compatibility and low-level schema versions are available through
  `toolchain::Toolchain::fingerprint`.
- The crate is currently pre-1.0. Breaking API changes require a minor version
  bump and release notes.

The MSRV is tested in CI against the packaged, minimal-feature library.

## Documentation

- [API documentation](https://docs.rs/rsvelte_core)
- [Repository](https://github.com/baseballyama/rsvelte)
- [crates.io publication policy](https://github.com/baseballyama/rsvelte/blob/main/docs/crates-io-publishing.md)

## License

MIT. See [LICENSE](LICENSE).
