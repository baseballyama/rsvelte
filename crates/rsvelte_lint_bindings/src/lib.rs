//! cdylib bindings for the rsvelte linter.
//!
//! Two out-of-process entry points — the wasm playground module ([`wasm`]) and
//! the Node `.node` addon ([`napi`]) — each a thin wrapper over
//! `rsvelte_lint::json_api`, so both engines return byte-identical JSON. This
//! crate carries no logic of its own; it exists purely to hold the `cdylib`
//! crate-type so `rsvelte_lint` can stay a pure rlib (see the `[lib]` note in
//! `Cargo.toml`).

#[cfg(feature = "wasm")]
pub mod wasm;

#[cfg(feature = "napi")]
pub mod napi;
