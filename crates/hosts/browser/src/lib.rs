//! Browser bindings for document rendering and language tasks.

pub mod computation;
pub mod document;
pub use computation::run_pipeline;
pub use document::{render_document, string_width_wasm};
