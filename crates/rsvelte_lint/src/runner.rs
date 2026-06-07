//! Top-level lint entry points: parse + analyze (validator wrap) + native rule
//! walk + suppression, merged into one sorted diagnostic list.

use std::path::Path;

use rsvelte_core::svelte_check::diagnostic::Diagnostic;
use rsvelte_core::{CompileOptions, ParseOptions, parse};

use crate::config::LintConfig;
use crate::context::LintContext;
use crate::diagnostic::{LintDiagnostic, TextEdit};
use crate::line_index::LineIndex;
use crate::registry::all_rules;
use crate::rule::Severity;
use crate::suppression::Suppressions;
use crate::visitor::{EnabledRule, LintVisitor};

/// Run the native rule engine, returning raw [`LintDiagnostic`]s (byte offsets,
/// fixes intact). Validator-wrapped compiler diagnostics are *not* included —
/// they're added by [`lint_source`] and are never autofixable.
fn native_diagnostics(source: &str, config: &LintConfig) -> Vec<LintDiagnostic> {
    let rules = all_rules();
    let enabled: Vec<EnabledRule> = rules
        .iter()
        .filter_map(|r| {
            let meta = r.meta();
            let severity = config.severity_for(meta);
            if severity == Severity::Off {
                return None;
            }
            Some(EnabledRule {
                rule: r.as_ref(),
                meta,
                severity,
            })
        })
        .collect();

    if enabled.is_empty() {
        return Vec::new();
    }
    let Ok(root) = parse(source, ParseOptions::default()) else {
        return Vec::new();
    };
    let mut ctx = LintContext::new();
    LintVisitor::new(enabled).visit_root(&mut ctx, &root);
    ctx.into_diagnostics()
}

/// Lint a single source string. `file` is used only for diagnostic paths.
pub fn lint_source(
    source: &str,
    file: &Path,
    options: &CompileOptions,
    config: &LintConfig,
) -> Vec<Diagnostic> {
    let line_index = LineIndex::new(source);

    // 1. Validator wrap — compiler warnings/errors/a11y (config applied inside).
    let mut diagnostics = crate::validator::validator_diagnostics(source, file, options, config);

    // 2. Native rule engine — single shared DFS over the template AST.
    for d in native_diagnostics(source, config) {
        diagnostics.push(d.to_output(file, &line_index));
    }

    // 3. Suppression directives (eslint-disable* + svelte-ignore).
    let suppressions = Suppressions::collect(source);
    diagnostics.retain(|d| match (&d.code, &d.range) {
        (Some(code), Some(range)) => !suppressions.is_suppressed(code, range.start.line),
        _ => true,
    });

    // 4. Stable order: by line, then column.
    diagnostics.sort_by_key(|d| {
        d.range
            .map(|r| (r.start.line, r.start.column))
            .unwrap_or((0, 0))
    });
    diagnostics
}

/// Result of an autofix pass.
pub struct FixResult {
    /// The fixed source (== input when nothing applied).
    pub output: String,
    /// How many fixes were applied.
    pub applied: usize,
}

/// Apply the autofixes from native rules to `source`. Only non-suppressed
/// findings contribute, and overlapping edits are resolved by taking the
/// earliest and skipping any that overlap it (a second pass picks up the rest).
pub fn fix_source(source: &str, config: &LintConfig) -> FixResult {
    let line_index = LineIndex::new(source);
    let suppressions = Suppressions::collect(source);

    // Gather candidate edits from non-suppressed fixable findings.
    let mut edits: Vec<TextEdit> = native_diagnostics(source, config)
        .into_iter()
        .filter(|d| !suppressions.is_suppressed(&d.rule, line_index.line(d.start)))
        .filter_map(|d| d.fix)
        .flat_map(|f| f.edits)
        .collect();

    // Earliest-first; greedily drop edits that overlap an already-selected one.
    edits.sort_by_key(|e| (e.start, e.end));
    let mut selected: Vec<TextEdit> = Vec::with_capacity(edits.len());
    let mut last_end = 0u32;
    for e in edits {
        if e.start >= last_end {
            last_end = e.end;
            selected.push(e);
        }
    }

    let applied = selected.len();
    if applied == 0 {
        return FixResult {
            output: source.to_string(),
            applied: 0,
        };
    }

    // Apply right-to-left so earlier offsets stay valid.
    selected.sort_by_key(|e| std::cmp::Reverse(e.start));
    let mut output = source.to_string();
    for e in selected {
        let (s, en) = (e.start as usize, e.end as usize);
        if s <= en && en <= output.len() {
            output.replace_range(s..en, &e.new_text);
        }
    }
    FixResult { output, applied }
}

/// Lint a file on disk.
pub fn lint_file(path: &Path, config: &LintConfig) -> std::io::Result<Vec<Diagnostic>> {
    let source = std::fs::read_to_string(path)?;
    let options = CompileOptions {
        filename: Some(path.display().to_string()),
        ..Default::default()
    };
    Ok(lint_source(&source, path, &options, config))
}

#[cfg(test)]
mod tests {
    use super::*;
    use rsvelte_core::svelte_check::diagnostic::DiagnosticSeverity;
    use std::path::PathBuf;

    fn lint(src: &str, config: &LintConfig) -> Vec<Diagnostic> {
        lint_source(
            src,
            &PathBuf::from("Test.svelte"),
            &CompileOptions::default(),
            config,
        )
    }

    fn codes(diags: &[Diagnostic]) -> Vec<String> {
        diags.iter().filter_map(|d| d.code.clone()).collect()
    }

    #[test]
    fn native_no_at_html_tags_fires() {
        let diags = lint("<div>{@html userInput}</div>", &LintConfig::recommended());
        assert!(codes(&diags).contains(&"svelte/no-at-html-tags".to_string()));
    }

    #[test]
    fn native_require_each_key_fires_only_when_unkeyed() {
        let unkeyed = lint(
            "{#each items as item}{item}{/each}",
            &LintConfig::recommended(),
        );
        assert!(codes(&unkeyed).contains(&"svelte/require-each-key".to_string()));

        let keyed = lint(
            "{#each items as item (item.id)}{item}{/each}",
            &LintConfig::recommended(),
        );
        assert!(!codes(&keyed).contains(&"svelte/require-each-key".to_string()));
    }

    #[test]
    fn validator_wrap_surfaces_a11y_warning() {
        // `<img>` without alt → compiler a11y warning, surfaced by the wrap.
        let diags = lint("<img src=\"x.png\" />", &LintConfig::recommended());
        assert!(
            codes(&diags).iter().any(|c| c.starts_with("a11y")),
            "expected an a11y_* code, got {:?}",
            codes(&diags)
        );
    }

    #[test]
    fn config_can_turn_a_rule_off() {
        let cfg = LintConfig::recommended().with_override("svelte/no-at-html-tags", Severity::Off);
        let diags = lint("<div>{@html x}</div>", &cfg);
        assert!(!codes(&diags).contains(&"svelte/no-at-html-tags".to_string()));
    }

    #[test]
    fn config_can_escalate_to_error() {
        let cfg =
            LintConfig::recommended().with_override("svelte/no-at-html-tags", Severity::Error);
        let diags = lint("<div>{@html x}</div>", &cfg);
        let d = diags
            .iter()
            .find(|d| d.code.as_deref() == Some("svelte/no-at-html-tags"))
            .unwrap();
        assert_eq!(d.severity, DiagnosticSeverity::Error);
    }

    #[test]
    fn eslint_disable_next_line_suppresses() {
        let src =
            "<div>\n<!-- eslint-disable-next-line svelte/no-at-html-tags -->\n{@html x}\n</div>";
        let diags = lint(src, &LintConfig::recommended());
        assert!(!codes(&diags).contains(&"svelte/no-at-html-tags".to_string()));
    }

    #[test]
    fn no_at_debug_tags_fires() {
        let diags = lint("{@debug foo}", &LintConfig::recommended());
        assert!(codes(&diags).contains(&"svelte/no-at-debug-tags".to_string()));
    }

    #[test]
    fn button_has_type_flags_missing_and_respects_type_and_spread() {
        let missing = lint("<button>x</button>", &LintConfig::recommended());
        assert!(codes(&missing).contains(&"svelte/button-has-type".to_string()));

        let typed = lint(
            "<button type=\"button\">x</button>",
            &LintConfig::recommended(),
        );
        assert!(!codes(&typed).contains(&"svelte/button-has-type".to_string()));

        let spread = lint("<button {...rest}>x</button>", &LintConfig::recommended());
        assert!(!codes(&spread).contains(&"svelte/button-has-type".to_string()));
    }

    #[test]
    fn fix_removes_debug_tag() {
        let res = fix_source("<p>{@debug foo}</p>", &LintConfig::recommended());
        assert_eq!(res.applied, 1);
        assert_eq!(res.output, "<p></p>");
    }

    #[test]
    fn fix_skips_suppressed_findings() {
        let src = "<!-- eslint-disable-next-line svelte/no-at-debug-tags -->\n{@debug foo}";
        let res = fix_source(src, &LintConfig::recommended());
        assert_eq!(res.applied, 0);
        assert_eq!(res.output, src);
    }

    #[test]
    fn fix_is_noop_when_rule_disabled() {
        let cfg = LintConfig::recommended().with_override("svelte/no-at-debug-tags", Severity::Off);
        let res = fix_source("{@debug foo}", &cfg);
        assert_eq!(res.applied, 0);
    }
}
