//! Top-level lint entry points: parse + analyze (validator wrap) + native rule
//! walk + suppression, merged into one sorted diagnostic list.

use std::path::Path;

use rsvelte_core::svelte_check::diagnostic::Diagnostic;
use rsvelte_core::{CompileOptions, ParseOptions, parse};

use crate::config::LintConfig;
use crate::context::LintContext;
use crate::line_index::LineIndex;
use crate::registry::all_rules;
use crate::rule::Severity;
use crate::suppression::Suppressions;
use crate::visitor::{EnabledRule, LintVisitor};

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

    if !enabled.is_empty()
        && let Ok(root) = parse(source, ParseOptions::default())
    {
        let mut ctx = LintContext::new();
        LintVisitor::new(enabled).visit_root(&mut ctx, &root);
        for d in ctx.into_diagnostics() {
            diagnostics.push(d.to_output(file, &line_index));
        }
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
}
