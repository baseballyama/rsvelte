//! Shared diagnostic records and output renderers for rsvelte products.
//!
//! This is a workspace-internal product boundary. The stable embedder-facing
//! diagnostics live in the `rsvelte` facade and use UTF-8 byte ranges.

mod diagnostic;
mod writers;

pub use diagnostic::{Diagnostic, DiagnosticSeverity, Position, Range};
pub use writers::{
    OutputFormat, Threshold, count_files_with_problems, write_completion, write_diagnostic,
    write_start, write_summary,
};
