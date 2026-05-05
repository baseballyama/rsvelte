//! `vite-plugin-svelte` (Wave 3) Rust-side helpers.
//!
//! The plan's Wave 3 keeps the public Vite plugin API as a thin JS shim
//! (loaded by the user from `vite.config.js`) and delegates the hot
//! paths to Rust over NAPI. The reusable helpers are:
//!
//! - `hmr` — given a previous + current `.svelte` source, decide whether
//!   the change is template-only (Vite can patch the running module) or
//!   needs a full reload.
//! - `resolver` — turn an `import` specifier from a Svelte file plus its
//!   importer into the actual filesystem path Vite should hand back.
//!
//! Compile + preprocess + svelte2tsx already have NAPI bindings via
//! `crate::napi`; those don't need anything here.

pub mod hmr;
pub mod resolver;

pub use hmr::{HmrChange, HmrDiff, hmr_diff};
pub use resolver::{ResolveOptions, ResolveResult, resolve_id};
