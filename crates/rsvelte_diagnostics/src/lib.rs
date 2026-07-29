//! Shared diagnostic records and output renderers for rsvelte products.
//!
//! This is a workspace-internal product boundary. The stable embedder-facing
//! diagnostics live in the `rsvelte` facade and use UTF-8 byte ranges.

mod diagnostic;
mod writers;

pub use diagnostic::{Diagnostic, DiagnosticSeverity, Position, Range};
pub use writers::{OutputFormat, Threshold, write_diagnostic, write_summary};
