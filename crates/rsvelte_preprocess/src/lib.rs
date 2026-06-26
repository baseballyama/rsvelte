//! Native Rust ports of the [awesome-svelte preprocessors][awesome] as rsvelte
//! [`PreprocessorGroup`]s that plug into the existing
//! `rsvelte_core::compiler::preprocess` engine.
//!
//! Each port mirrors its upstream package's public surface and is verified
//! against that package's own fixtures (see `tests/`).
//!
//! [awesome]: https://github.com/TheComputerM/awesome-svelte#preprocessing
//! [`PreprocessorGroup`]: rsvelte_core::compiler::preprocess::types::PreprocessorGroup

pub mod switch_case;

pub use switch_case::switch_case;
