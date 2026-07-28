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

#[cfg(feature = "wasm")]
mod compiler_wasm;

#[cfg(feature = "wasm")]
mod ast {
    pub use rsvelte_core::ast::*;
}

#[cfg(feature = "wasm")]
mod compiler {
    pub use rsvelte_core::compiler::*;
}

#[cfg(feature = "wasm")]
mod svelte2tsx {
    pub use rsvelte_projection::svelte2tsx::*;
}

#[cfg(feature = "napi")]
pub mod napi;
