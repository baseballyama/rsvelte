//! Parity tests for `svelte/comment-directive`.
//!
//! Upstream tests this rule inline (`tests/src/rules/comment-directive.ts`),
//! not via the fixture corpus, and most of its cases lean on ESLint *core* JS
//! rules (`no-undef`, `space-infix-ops`, `no-unused-vars`) that rsvelte does not
//! implement. We therefore port the subset that exercises the rule's own logic
//! using the Svelte rules rsvelte *does* have — `svelte/no-at-html-tags` and
//! `svelte/no-at-debug-tags` — which is exactly the surface upstream's
//! `reportUnusedDisableDirectives` describe-block uses.
//!
//! Each case mirrors an upstream `it(...)`. The comment-directive reports are
//! asserted exactly (`message`, `line`, `column`); the unrelated `@html`/`@debug`
//! findings are asserted by `(ruleId, line)` only — matching what upstream
//! asserts for them — since their precise column/message belong to those rules,
//! not to comment-directive.

use std::path::PathBuf;

use rsvelte_core::CompileOptions;
use rsvelte_lint::{LintConfig, lint_source};

fn config() -> LintConfig {
    LintConfig::from_json_str(
        r#"{
            "extends": ["none"],
            "rules": {
                "svelte/comment-directive": ["error", { "reportUnusedDisableDirectives": true }],
                "svelte/no-at-html-tags": "error",
                "svelte/no-at-debug-tags": "error"
            }
        }"#,
    )
    .unwrap()
}

/// Comment-directive reports only, as `(line, column-1-based, message)`.
fn directive_reports(src: &str) -> Vec<(u32, u32, String)> {
    let mut out: Vec<(u32, u32, String)> = lint_source(
        src,
        &PathBuf::from("test.svelte"),
        &CompileOptions::default(),
        &config(),
    )
    .into_iter()
    .filter_map(|d| {
        if d.code.as_deref() != Some("svelte/comment-directive") {
            return None;
        }
        let r = d.range?;
        Some((r.start.line, r.start.column + 1, d.message))
    })
    .collect();
    out.sort();
    out
}

/// Non-comment-directive `svelte/*` findings, as `(ruleId, line)`.
fn other_findings(src: &str) -> Vec<(String, u32)> {
    let mut out: Vec<(String, u32)> = lint_source(
        src,
        &PathBuf::from("test.svelte"),
        &CompileOptions::default(),
        &config(),
    )
    .into_iter()
    .filter_map(|d| {
        let code = d.code?;
        if !code.starts_with("svelte/") || code == "svelte/comment-directive" {
            return None;
        }
        Some((code, d.range?.start.line))
    })
    .collect();
    out.sort();
    out
}

fn report(line: u32, col: u32, message: &str) -> (u32, u32, String) {
    (line, col, message.to_string())
}

#[test]
fn report_unused_eslint_disable() {
    let code = "\n        <!-- eslint-disable -->\n        <div>Hello</div>\n      ";
    assert_eq!(
        directive_reports(code),
        vec![report(
            2,
            9,
            "Unused eslint-disable directive (no problems were reported)."
        )]
    );
    assert_eq!(other_findings(code), Vec::new());
}

#[test]
fn dont_report_used_eslint_disable() {
    let code =
        "\n        <!-- eslint-disable -->\n        <div>{@html foo}{@debug foo}</div>\n      ";
    assert_eq!(directive_reports(code), Vec::new());
    // Both findings are suppressed by the bare disable.
    assert_eq!(other_findings(code), Vec::new());
}

#[test]
fn disable_and_report_unused_eslint_disable() {
    let code = "\n        <!-- eslint-disable -->\n        <div>{@html foo}{@debug foo}</div>\n        <!-- eslint-enable -->\n        <!-- eslint-disable -->\n        <div>Hello</div>\n      ";
    assert_eq!(
        directive_reports(code),
        vec![report(
            5,
            9,
            "Unused eslint-disable directive (no problems were reported)."
        )]
    );
}

#[test]
fn report_unused_eslint_disable_two_rules() {
    let code = "\n        <!-- eslint-disable svelte/no-at-debug-tags, svelte/no-at-html-tags -->\n        <div>Hello</div>\n      ";
    assert_eq!(
        directive_reports(code),
        vec![
            report(
                2,
                29,
                "Unused eslint-disable directive (no problems were reported from 'svelte/no-at-debug-tags')."
            ),
            report(
                2,
                54,
                "Unused eslint-disable directive (no problems were reported from 'svelte/no-at-html-tags')."
            ),
        ]
    );
}

#[test]
fn report_unused_eslint_disable_next_line_two_rules() {
    let code = "\n        <!-- eslint-disable-next-line svelte/no-at-debug-tags, svelte/no-at-html-tags -->\n        <div>Hello</div>\n        <div>{@html foo}{@debug foo}</div>\n      ";
    assert_eq!(
        directive_reports(code),
        vec![
            report(
                2,
                39,
                "Unused eslint-disable-next-line directive (no problems were reported from 'svelte/no-at-debug-tags')."
            ),
            report(
                2,
                64,
                "Unused eslint-disable-next-line directive (no problems were reported from 'svelte/no-at-html-tags')."
            ),
        ]
    );
    // The findings on line 4 are *not* covered by the next-line directive.
    assert_eq!(
        other_findings(code),
        vec![
            ("svelte/no-at-debug-tags".to_string(), 4),
            ("svelte/no-at-html-tags".to_string(), 4),
        ]
    );
}

#[test]
fn dont_report_used_eslint_disable_next_line_two_rules() {
    let code = "\n        <!-- eslint-disable-next-line svelte/no-at-debug-tags, svelte/no-at-html-tags -->\n        <div>{@html foo}{@debug foo}</div>\n      ";
    assert_eq!(directive_reports(code), Vec::new());
    assert_eq!(other_findings(code), Vec::new());
}

#[test]
fn dont_report_used_with_duplicate_eslint_disable() {
    let code = "\n        <!-- eslint-disable -->\n        <!-- eslint-disable-next-line svelte/no-at-debug-tags, svelte/no-at-html-tags -->\n        <div>{@html foo}</div><!-- eslint-disable-line svelte/no-at-debug-tags, svelte/no-at-html-tags -->\n      ";
    assert_eq!(directive_reports(code), Vec::new());
    assert_eq!(other_findings(code), Vec::new());
}

#[test]
fn report_unused_eslint_enable() {
    let code = "\n        <!-- eslint-enable -->\n      ";
    assert_eq!(
        directive_reports(code),
        vec![report(
            2,
            9,
            "Unused eslint-enable directive (reporting is not suppressed)."
        )]
    );
}

#[test]
fn report_unused_eslint_enable_rule() {
    let code = "\n        <!-- eslint-disable svelte/no-at-html-tags -->\n        <div>{@html foo}</div>\n        <!-- eslint-enable svelte/no-at-debug-tags -->\n      ";
    assert_eq!(
        directive_reports(code),
        vec![report(
            4,
            28,
            "Unused eslint-enable directive (reporting from 'svelte/no-at-debug-tags' is not suppressed)."
        )]
    );
}
