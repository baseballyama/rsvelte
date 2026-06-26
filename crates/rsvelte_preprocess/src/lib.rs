//! Native Rust ports of the [awesome-svelte preprocessors][awesome] as rsvelte
//! [`PreprocessorGroup`]s that plug into the existing
//! `rsvelte_core::compiler::preprocess` engine.
//!
//! Each port mirrors its upstream package's public surface and is verified
//! against that package's own fixtures (see `tests/`).
//!
//! [awesome]: https://github.com/TheComputerM/awesome-svelte#preprocessing
//! [`PreprocessorGroup`]: rsvelte_core::compiler::preprocess::types::PreprocessorGroup

pub mod filter;
pub mod switch_case;

#[cfg(feature = "sass")]
pub mod sass;

#[cfg(feature = "less")]
pub mod less;

pub use switch_case::switch_case;

#[cfg(feature = "sass")]
pub use sass::sass;

#[cfg(feature = "less")]
pub use less::less;
