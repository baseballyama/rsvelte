//! Conversion from rsvelte's lint diagnostics to LSP `Diagnostic`s.

use std::str::FromStr;

use lsp_types::{
    CodeDescription, Diagnostic, DiagnosticSeverity, NumberOrString, Position, Range, Uri,
};
use rsvelte_diagnostics::{Diagnostic as LintDiagnostic, DiagnosticSeverity as LintSeverity};

use crate::settings::{CompilerWarnings, WarningLevel};

/// The `source` of a finding from one of rsvelte's own lint rules.
const SOURCE: &str = "rsvelte";

/// The `source` of a compiler warning or error. `svelte` is what the official
/// language server publishes, and what a `svelte-ignore` quickfix keys off.
pub const COMPILER_SOURCE: &str = "svelte";

const WARNING_DOCS: &str = "https://svelte.dev/docs/svelte/compiler-warnings#";
const ERROR_DOCS: &str = "https://svelte.dev/docs/svelte/compiler-errors#";

/// Whether a code names a compiler warning/error rather than one of rsvelte's
/// own rules, whose ids are always namespaced (`svelte/no-at-html-tags`).
pub fn is_compiler_code(code: &str) -> bool {
    !code.contains('/')
}

/// Convert one lint diagnostic, or drop it when the client asked for its code
/// to be ignored. rsvelte reports 1-based lines with 0-based UTF-16 columns
/// (the encoding LSP uses), so only the line needs rebasing.
pub fn to_lsp(diagnostic: &LintDiagnostic, warnings: &CompilerWarnings) -> Option<Diagnostic> {
    let range = diagnostic.range.map_or_else(
        || Range::new(Position::new(0, 0), Position::new(0, 0)),
        |r| {
            Range::new(
                Position::new(r.start.line.saturating_sub(1), r.start.column),
                Position::new(r.end.line.saturating_sub(1), r.end.column),
            )
        },
    );
    let code = diagnostic.code.as_deref();
    let compiler = code.is_some_and(is_compiler_code);
    let level = match code.filter(|_| compiler) {
        Some(code) => warnings.get(code).copied(),
        None => None,
    };
    if level == Some(WarningLevel::Ignore) {
        return None;
    }
    let mut severity = severity(diagnostic.severity);
    if level == Some(WarningLevel::Error) {
        severity = DiagnosticSeverity::ERROR;
    }
    Some(Diagnostic {
        range,
        severity: Some(severity),
        code: diagnostic.code.clone().map(NumberOrString::String),
        code_description: code.filter(|_| compiler).and_then(|code| {
            // The page a code is documented on follows how the compiler
            // reported it, not the severity the client then asked for.
            code_description(code, diagnostic.severity)
        }),
        source: Some(if compiler { COMPILER_SOURCE } else { SOURCE }.to_string()),
        message: diagnostic.message.clone(),
        ..Diagnostic::default()
    })
}

/// The documentation link for a compiler code, mirroring the official server:
/// only lower-case, word-separated codes are documented, and the anchor always
/// spells them with underscores.
fn code_description(code: &str, severity: LintSeverity) -> Option<CodeDescription> {
    if !code.starts_with(|c: char| c.is_ascii_lowercase()) || !code.contains(['-', '_']) {
        return None;
    }
    let base = match severity {
        LintSeverity::Error => ERROR_DOCS,
        _ => WARNING_DOCS,
    };
    let href = Uri::from_str(&format!("{base}{}", code.replace('-', "_"))).ok()?;
    Some(CodeDescription { href })
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
    use rsvelte_diagnostics::{Position as LintPosition, Range as LintRange};
    use std::collections::HashMap;
    use std::path::PathBuf;
    use std::sync::Arc;

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

    fn compiler_diagnostic(code: &str, severity: LintSeverity) -> LintDiagnostic {
        LintDiagnostic {
            code: Some(code.to_string()),
            severity,
            ..diagnostic(None)
        }
    }

    fn convert(diagnostic: &LintDiagnostic) -> Diagnostic {
        to_lsp(diagnostic, &CompilerWarnings::default()).unwrap()
    }

    fn warnings(entries: &[(&str, WarningLevel)]) -> CompilerWarnings {
        Arc::new(
            entries
                .iter()
                .map(|(code, level)| ((*code).to_string(), *level))
                .collect::<HashMap<_, _>>(),
        )
    }

    #[test]
    fn lines_become_zero_based() {
        let d = convert(&diagnostic(Some(LintRange {
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
        // A rule of rsvelte's own is not documented on the compiler's pages.
        assert!(d.code_description.is_none());
    }

    #[test]
    fn a_missing_range_maps_to_the_start_of_the_file() {
        let d = convert(&diagnostic(None));
        assert_eq!(
            d.range,
            Range::new(Position::new(0, 0), Position::new(0, 0))
        );
    }

    #[test]
    fn a_compiler_warning_carries_the_svelte_source_and_its_docs_link() {
        let d = convert(&compiler_diagnostic(
            "a11y_missing_attribute",
            LintSeverity::Warning,
        ));
        assert_eq!(d.source.as_deref(), Some("svelte"));
        assert_eq!(
            d.code_description.unwrap().href.as_str(),
            "https://svelte.dev/docs/svelte/compiler-warnings#a11y_missing_attribute"
        );
    }

    #[test]
    fn a_compiler_error_links_to_the_error_docs() {
        let d = convert(&compiler_diagnostic(
            "invalid_rune_args",
            LintSeverity::Error,
        ));
        assert_eq!(
            d.code_description.unwrap().href.as_str(),
            "https://svelte.dev/docs/svelte/compiler-errors#invalid_rune_args"
        );
    }

    /// The official rule spells the anchor with underscores whichever separator
    /// the code used, and documents nothing that is not a lower-case word code.
    #[test]
    fn only_word_separated_lowercase_codes_are_documented() {
        let d = convert(&compiler_diagnostic(
            "css-unused-selector",
            LintSeverity::Warning,
        ));
        assert_eq!(
            d.code_description.unwrap().href.as_str(),
            "https://svelte.dev/docs/svelte/compiler-warnings#css_unused_selector"
        );

        for code in ["Uppercase_code", "nodash"] {
            let d = convert(&compiler_diagnostic(code, LintSeverity::Warning));
            assert!(d.code_description.is_none(), "{code} should not be linked");
        }
    }

    #[test]
    fn compiler_warning_settings_escalate_and_drop() {
        let ignored = compiler_diagnostic("a11y_missing_attribute", LintSeverity::Warning);
        let escalated = compiler_diagnostic("state_referenced_locally", LintSeverity::Warning);
        let levels = warnings(&[
            ("a11y_missing_attribute", WarningLevel::Ignore),
            ("state_referenced_locally", WarningLevel::Error),
        ]);

        assert!(to_lsp(&ignored, &levels).is_none());
        let d = to_lsp(&escalated, &levels).unwrap();
        assert_eq!(d.severity, Some(DiagnosticSeverity::ERROR));
        // Escalating does not move the code off the warning docs page.
        assert_eq!(
            d.code_description.unwrap().href.as_str(),
            "https://svelte.dev/docs/svelte/compiler-warnings#state_referenced_locally"
        );
    }

    /// The setting names compiler codes, so a rule of rsvelte's own that happens
    /// to be listed keeps its severity.
    #[test]
    fn compiler_warning_settings_leave_lint_rules_alone() {
        let levels = warnings(&[("svelte/no-at-html-tags", WarningLevel::Ignore)]);
        let d = to_lsp(&diagnostic(None), &levels).unwrap();
        assert_eq!(d.severity, Some(DiagnosticSeverity::WARNING));
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
            convert(at_html).range,
            Range::new(Position::new(0, 9), Position::new(0, 18))
        );
    }
}
