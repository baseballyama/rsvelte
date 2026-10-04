//! Browser bindings for document rendering and language tasks.

#![expect(
    clippy::multiple_crate_versions,
    reason = "wasm-bindgen's macros use syn 2 and serde_derive 1.0.229 uses syn 3; one syn would \
              need an older serde"
)]

pub mod computation;
pub mod document;
pub use computation::run_pipeline;
pub use document::{render_document, string_width_wasm};
