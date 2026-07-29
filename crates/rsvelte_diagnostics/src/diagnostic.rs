//! Diagnostic types — the canonical shape that every source (rsvelte
//! compile errors, rsvelte warnings, future tsgo type errors) must
//! produce. The writers in `writers.rs` consume only this type, which
//! keeps the source-specific glue thin.

use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum DiagnosticSeverity {
    Error,
    Warning,
    Info,
    Hint,
}

impl DiagnosticSeverity {
    pub fn label(self) -> &'static str {
        match self {
            DiagnosticSeverity::Error => "error",
            DiagnosticSeverity::Warning => "warning",
            DiagnosticSeverity::Info => "info",
            DiagnosticSeverity::Hint => "hint",
        }
    }
}

/// One-based source position (line, column). Mirrors the JS reference's
/// LSP-shaped diagnostics.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Position {
    pub line: u32,
    pub column: u32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub struct Range {
    pub start: Position,
    pub end: Position,
}

/// A single user-visible diagnostic.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Diagnostic {
    pub file: PathBuf,
    pub severity: DiagnosticSeverity,
    pub code: Option<String>,
    pub message: String,
    pub range: Option<Range>,
    /// "svelte" / "ts" / "css" — matches the JS reference's
    /// `--diagnostic-sources` filter values.
    pub source: &'static str,
}
