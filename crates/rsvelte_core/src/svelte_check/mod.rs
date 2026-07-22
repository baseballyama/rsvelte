//! `svelte-check` — Wave 2 of the ecosystem port.
//!
//! Walks a Svelte project, runs the rsvelte compiler on every `.svelte` file
//! to collect compile-time errors and warnings, and (later) shells out to
//! tsgo to add TypeScript-level diagnostics. Mirrors the JS reference at
//! `submodules/language-tools/packages/svelte-check/src/`.
//!
//! This v0.1 covers only the Svelte-side diagnostics. tsgo integration is the
//! next milestone.

pub mod config;
pub mod diagnostic;
pub mod kit_file;
pub mod manifest;
pub mod mapper;
pub mod overlay;
pub mod runner;
pub mod tsgo;
pub mod walker;
pub mod warning_filter;
pub mod watch;
pub mod writers;

pub use diagnostic::{Diagnostic, DiagnosticSeverity};
pub use runner::{RunOptions, RunResult, run};
pub use walker::find_svelte_files;
pub use writers::{OutputFormat, Threshold};
