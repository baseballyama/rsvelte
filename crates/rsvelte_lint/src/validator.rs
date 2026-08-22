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

use rsvelte_core::{CompileError, CompileOptions, GenerateMode, compile};
use rsvelte_diagnostics::{Diagnostic, DiagnosticSeverity, Position, Range};
use std::path::Path;

use crate::config::LintConfig;
use crate::rule::Severity;

pub(crate) const fn to_dsev(s: Severity) -> DiagnosticSeverity {
    match s {
        Severity::Error => DiagnosticSeverity::Error,
        // `Off` is filtered before this is called; map defensively.
        Severity::Warn | Severity::Off => DiagnosticSeverity::Warning,
    }
}

fn position_component(value: usize) -> u32 {
    u32::try_from(value).expect("compiler positions are represented as u32")
}

/// Build an output [`Range`] from UTF-8 byte offsets via the line index. Used by
/// the source-scan meta-rules that work in byte offsets rather than compiler
/// positions.
pub(crate) fn range_from_byte(li: &crate::line_index::LineIndex, start: u32, end: u32) -> Range {
    let (sl, sc) = li.position(start);
    let (el, ec) = li.position(end);
    Range {
        start: Position {
            line: sl,
            column: sc,
        },
        end: Position {
            line: el,
            column: ec,
        },
    }
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
            line: position_component(start.line),
            column: position_component(start.column),
        },
        end: Position {
            line: position_component(end.line),
            column: position_component(end.column),
        },
    })
}

/// Run the analyzer and return its findings as output diagnostics, with config
/// overrides already applied (`Off` codes dropped).
#[must_use]
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
            let (message, range) = compile_error_text_and_range(&e, source);
            vec![Diagnostic {
                file: file.to_path_buf(),
                severity: to_dsev(sev),
                code: Some(code),
                message,
                range,
                source: "svelte",
            }]
        }
    }
}

/// Extract `(code, message, range)` from a hard compile error for the
/// `valid-compile` rule. Analysis errors (`ValidationWithCode`) carry no span
/// today, so the range is `None` (callers fall back to the default position).
pub(crate) fn compile_error_parts(
    e: &CompileError,
    source: &str,
) -> (String, String, Option<Range>) {
    let (message, range) = compile_error_text_and_range(e, source);
    (compile_error_code(e), message, range)
}

/// A parse error's own `Display` plus its span; every other kind falls back to
/// `CompileError`'s, which has no position to give.
///
/// `CompileError::Parse` formats its payload with `{:?}`, so going through it
/// would put a Rust struct literal in front of the user.
fn compile_error_text_and_range(e: &CompileError, source: &str) -> (String, Option<Range>) {
    match e {
        CompileError::Parse(pe) => {
            let (start, end) = pe.span();
            let li = crate::line_index::LineIndex::new(source);
            let clamp = |b: usize| u32::try_from(b.min(source.len())).unwrap_or(u32::MAX);
            (
                format!("Parsing error: {pe}"),
                Some(range_from_byte(&li, clamp(start), clamp(end))),
            )
        }
        _ => (format!("{e}"), None),
    }
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
