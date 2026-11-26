//! Browser bindings for language tasks.

pub mod compiler;
#[cfg(feature = "playground")]
pub mod computation;
#[cfg(feature = "playground")]
pub use computation::run_pipeline;
