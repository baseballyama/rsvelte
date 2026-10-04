//! Svelte 5 components compiled to Vue Vapor client modules.
//!
//! Svelte parsing, normalization, resolution, and analysis are shared with the other tasks.
//! The translation builds a new JavaScript tree and a Vue template tree. The Rust Vapor
//! backend emits DOM factories, render effects, branches, and loops from those trees.
//! It does not print and reparse a Vue component or call the JavaScript Vue compiler.
//!
//! Coverage and remaining work are listed in the crate's `COVERAGE.md`. Unsupported constructs
//! produce `vuelte_unsupported` diagnostics. Validation lives in [`script`] and [`template`].
//!
//! The existing `vuelte.compile/{client,server}` task identifiers remain available. Client
//! modules require a Vue runtime with Vapor support and mount with `createVaporApp`.
//! The native server target emits HTML and head content for Vue SSR. Hydration is not supported.
//! Runtime tests use Vue 3.6.0-rc.10 and compare against official Svelte behavior.

pub mod compilation;
pub mod computation;
use compilation::{R, unsupported};
pub use compilation::{Translation, check, compile, helpers, script, template, translate};
pub use computation::{Checked, Compile, PLUGIN, register};
