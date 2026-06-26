//! Native Rust ports of the [awesome-svelte preprocessors][awesome] as rsvelte
//! [`PreprocessorGroup`]s that plug into the existing
//! `rsvelte_core::compiler::preprocess` engine.
//!
//! Each port mirrors its upstream package's public surface and is verified
//! against that package's own fixtures (see `tests/`).
//!
//! Ports with a faithful pure-Rust backend are implemented natively
//! (`switch_case`, `sass`, the `svelte_preprocess` native subset). Ports whose
//! output is defined by a specific JS engine with no equivalent Rust backend
//! (`less`, `mdsvex`, `markdown`, `modular_css`, `sveltex`) use the plan's
//! JS-fallback boundary (§2.2): a Node bridge to the user's installed tool, so
//! they stay faithful drop-ins on the rsvelte pipeline while a native core is
//! developed.
//!
//! [awesome]: https://github.com/TheComputerM/awesome-svelte#preprocessing
//! [`PreprocessorGroup`]: rsvelte_core::compiler::preprocess::types::PreprocessorGroup

pub mod filter;
pub mod switch_case;

#[cfg(feature = "bridge")]
pub mod bridge;

#[cfg(feature = "sass")]
pub mod sass;

#[cfg(feature = "less")]
pub mod less;

#[cfg(feature = "svelte-preprocess")]
pub mod svelte_preprocess;

#[cfg(feature = "mdsvex")]
pub mod mdsvex;

#[cfg(feature = "markdown")]
pub mod markdown;

#[cfg(feature = "modular-css")]
pub mod modular_css;

#[cfg(feature = "sveltex")]
pub mod sveltex;

pub use switch_case::switch_case;

#[cfg(feature = "sass")]
pub use sass::sass;

#[cfg(feature = "less")]
pub use less::less;

#[cfg(feature = "svelte-preprocess")]
pub use svelte_preprocess::svelte_preprocess;

#[cfg(feature = "mdsvex")]
pub use mdsvex::mdsvex;

#[cfg(feature = "markdown")]
pub use markdown::markdown;

#[cfg(feature = "modular-css")]
pub use modular_css::modular_css;

#[cfg(feature = "sveltex")]
pub use sveltex::sveltex;
