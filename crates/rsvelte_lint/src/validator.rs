//! The validator wrap — design doc §D "the single biggest lever".
//!
//! The rsvelte compiler already emits ~70 warning codes, ~145 error codes, and
//! 42 `a11y_*` rules during analysis. We compile with [`GenerateMode::None`]
//! (codegen skipped — "useful for tooling that only needs warnings") and
//! surface those findings as lint diagnostics, giving compiler-parity coverage
//! with near-zero rule code. Config overrides apply by code, so a user can turn
//! a compiler code off or up to error like any other rule.
//!
//! Compiler positions are already line/column (0-indexed column, UTF-16),
//! matching the output `Diagnostic`, so these don't round-trip through byte
//! offsets the way native-rule findings do.

use rsvelte_core::svelte_check::diagnostic::{Diagnostic, DiagnosticSeverity, Position, Range};
use rsvelte_core::{CompileError, CompileOptions, GenerateMode, compile};
use std::path::Path;

use crate::config::LintConfig;
use crate::rule::Severity;

pub(crate) fn to_dsev(s: Severity) -> DiagnosticSeverity {
    match s {
        Severity::Error => DiagnosticSeverity::Error,
        // `Off` is filtered before this is called; map defensively.
        Severity::Warn | Severity::Off => DiagnosticSeverity::Warning,
    }
}

/// Build an output [`Range`] from UTF-8 byte offsets via the line index. Used by
/// the source-scan meta-rules that work in byte offsets rather than compiler
/// positions.
pub(crate) fn range_from_byte(
    li: &crate::line_index::LineIndex,
    start: u32,
    end: u32,
) -> Option<Range> {
    let (sl, sc) = li.position(start);
    let (el, ec) = li.position(end);
    Some(Range {
        start: Position {
            line: sl,
            column: sc,
        },
        end: Position {
            line: el,
            column: ec,
        },
    })
}

pub(crate) fn range_from(
    start: Option<&rsvelte_core::compiler::Position>,
    end: Option<&rsvelte_core::compiler::Position>,
) -> Option<Range> {
    let start = start?;
    let end = end.unwrap_or(start);
    // Compiler columns are 0-indexed, matching the output convention used by
    // `svelte_check::runner::range_from_warning`.
    Some(Range {
        start: Position {
            line: start.line as u32,
            column: start.column as u32,
        },
        end: Position {
            line: end.line as u32,
            column: end.column as u32,
        },
    })
}

/// Run the analyzer and return its findings as output diagnostics, with config
/// overrides already applied (`Off` codes dropped).
pub fn validator_diagnostics(
    source: &str,
    file: &Path,
    base_options: &CompileOptions,
    config: &LintConfig,
) -> Vec<Diagnostic> {
    let options = CompileOptions {
        generate: GenerateMode::None,
        filename: Some(file.display().to_string()),
        ..base_options.clone()
    };

    match compile(source, options) {
        Ok(res) => res
            .warnings
            .into_iter()
            .filter_map(|w| {
                let sev = config.resolve_code(&w.code, Severity::Warn);
                if sev == Severity::Off {
                    return None;
                }
                Some(Diagnostic {
                    file: file.to_path_buf(),
                    severity: to_dsev(sev),
                    range: range_from(w.start.as_ref(), w.end.as_ref()),
                    code: Some(w.code),
                    message: w.message,
                    source: "svelte",
                })
            })
            .collect(),
        Err(e) => {
            let code = compile_error_code(&e);
            let sev = config.resolve_code(&code, Severity::Error);
            if sev == Severity::Off {
                return Vec::new();
            }
            vec![Diagnostic {
                file: file.to_path_buf(),
                severity: to_dsev(sev),
                code: Some(code),
                message: format!("{e}"),
                range: None,
                source: "svelte",
            }]
        }
    }
}

/// Extract `(code, message, range)` from a hard compile error for the
/// `valid-compile` rule. Analysis errors (`ValidationWithCode`) carry no span
/// today, so the range is `None` (callers fall back to the default position).
pub(crate) fn compile_error_parts(e: &CompileError) -> (String, String, Option<Range>) {
    (compile_error_code(e), format!("{e}"), None)
}

/// Best-effort extraction of a stable code from a hard compile error so it can
/// be configured/suppressed like a warning code.
fn compile_error_code(e: &CompileError) -> String {
    use rsvelte_core::compiler::AnalysisError;
    match e {
        CompileError::Analysis(AnalysisError::ValidationWithCode { code, .. }) => code.clone(),
        CompileError::Parse(_) => "parse-error".to_string(),
        _ => "compile-error".to_string(),
    }
}
