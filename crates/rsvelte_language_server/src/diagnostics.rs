//! Conversion from rsvelte's lint diagnostics to LSP `Diagnostic`s.

use lsp_types::{Diagnostic, DiagnosticSeverity, NumberOrString, Position, Range};
use rsvelte_core::svelte_check::diagnostic::{
    Diagnostic as LintDiagnostic, DiagnosticSeverity as LintSeverity,
};

/// The `source` field every diagnostic this server publishes carries.
const SOURCE: &str = "rsvelte";

/// Convert one lint diagnostic. rsvelte reports 1-based lines with 0-based
/// UTF-16 columns (the encoding LSP uses), so only the line needs rebasing.
pub fn to_lsp(diagnostic: &LintDiagnostic) -> Diagnostic {
    let range = diagnostic.range.map_or_else(
        || Range::new(Position::new(0, 0), Position::new(0, 0)),
        |r| {
            Range::new(
                Position::new(r.start.line.saturating_sub(1), r.start.column),
                Position::new(r.end.line.saturating_sub(1), r.end.column),
            )
        },
    );
    Diagnostic {
        range,
        severity: Some(severity(diagnostic.severity)),
        code: diagnostic.code.clone().map(NumberOrString::String),
        source: Some(SOURCE.to_string()),
        message: diagnostic.message.clone(),
        ..Diagnostic::default()
    }
}

fn severity(severity: LintSeverity) -> DiagnosticSeverity {
    match severity {
        LintSeverity::Error => DiagnosticSeverity::ERROR,
        LintSeverity::Warning => DiagnosticSeverity::WARNING,
        LintSeverity::Info => DiagnosticSeverity::INFORMATION,
        LintSeverity::Hint => DiagnosticSeverity::HINT,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rsvelte_core::svelte_check::diagnostic::{Position as LintPosition, Range as LintRange};
    use std::path::PathBuf;

    fn diagnostic(range: Option<LintRange>) -> LintDiagnostic {
        LintDiagnostic {
            file: PathBuf::from("App.svelte"),
            severity: LintSeverity::Warning,
            code: Some("svelte/no-at-html-tags".to_string()),
            message: "message".to_string(),
            range,
            source: "svelte",
        }
    }

    #[test]
    fn lines_become_zero_based() {
        let d = to_lsp(&diagnostic(Some(LintRange {
            start: LintPosition { line: 3, column: 4 },
            end: LintPosition { line: 3, column: 9 },
        })));
        assert_eq!(
            d.range,
            Range::new(Position::new(2, 4), Position::new(2, 9))
        );
        assert_eq!(d.severity, Some(DiagnosticSeverity::WARNING));
        assert_eq!(
            d.code,
            Some(NumberOrString::String("svelte/no-at-html-tags".to_string()))
        );
        assert_eq!(d.source.as_deref(), Some("rsvelte"));
    }

    #[test]
    fn a_missing_range_maps_to_the_start_of_the_file() {
        let d = to_lsp(&diagnostic(None));
        assert_eq!(
            d.range,
            Range::new(Position::new(0, 0), Position::new(0, 0))
        );
    }

    /// End-to-end over the real linter with a hand-computed expectation, so a
    /// change in how columns are counted cannot slip past: each `💡` is two
    /// UTF-16 code units, putting `{@html v}` at units 9..18 of line 0.
    #[test]
    fn a_real_finding_lands_on_hand_counted_utf16_columns() {
        let path = PathBuf::from("App.svelte");
        let source = "<div>💡💡{@html v}</div>";
        let found = rsvelte_lint::lint_source(
            source,
            &path,
            &rsvelte_core::CompileOptions::default(),
            &rsvelte_lint::LintConfig::recommended(),
        );
        let at_html = found
            .iter()
            .find(|d| d.code.as_deref() == Some("svelte/no-at-html-tags"))
            .expect("the fixture should report svelte/no-at-html-tags");

        assert_eq!(
            to_lsp(at_html).range,
            Range::new(Position::new(0, 9), Position::new(0, 18))
        );
    }
}
