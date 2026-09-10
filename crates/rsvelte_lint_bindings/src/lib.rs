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

// Linked, not re-exported: `rsvelte_compiler_wasm`'s `#[wasm_bindgen]` items
// are collected into whatever cdylib links it, so naming the crate here is what
// puts `compile`, `compileModule`, `parse_svelte` and `version` into the
// playground module. Nothing in this crate calls it. The extern name is the
// package's `[lib] name`, not the package name.
#[cfg(feature = "wasm")]
use rsvelte_compiler as _;

#[cfg(feature = "wasm")]
mod svelte2tsx_wasm;

#[cfg(feature = "wasm")]
mod svelte2tsx {
    pub use rsvelte_projection::svelte2tsx::*;
}

#[cfg(feature = "napi")]
pub mod napi;
