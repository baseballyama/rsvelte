//! `svelte-ignore` and `eslint-disable-next-line` do not share an id vocabulary.
//!
//! Two axes — the directive (`svelte-ignore` / `eslint-disable-next-line`) and
//! the id it names (a compiler warning code / a `svelte/<rule>` plugin id) —
//! give four cells, and each directive suppresses exactly one of them. Two
//! comment-free controls pin that both rules fire when nothing suppresses them,
//! so a green cell means "suppressed" rather than "never reported".
//!
//! Every expected value below is pasted from
//! `node scripts/compat-corpus/lint-oracle/run.mjs --rules <the three rules
//! this file enables>` over these exact sources; none is hand-written. Only
//! `(ruleId, line, column)` is asserted: `svelte/valid-compile` is on the lint
//! gate's `EXCLUDE` list and its message text carries a compiler-side
//! divergence that is not this file's subject.
//!
//! That exclusion is also why the two compiler-code cells live here and only
//! here, which was measured rather than assumed: of the ten lint gates, seven
//! scope themselves with `ruleUniverse()`, whose `EXCLUDE` drops
//! `svelte/valid-compile`; two drive upstream's `flat/recommended`, which does
//! not carry that rule; and the last compares `meta.conditions` declarations
//! rather than findings. So no gate can observe either cell at any corpus size,
//! and this file is the gate that holds that shape.

use std::path::PathBuf;

use rsvelte_core::CompileOptions;
use rsvelte_lint::{LintConfig, lint_source};

fn config() -> LintConfig {
    LintConfig::from_json_str(
        r#"{
            "extends": ["none"],
            "rules": {
                "svelte/no-at-html-tags": "warn",
                "svelte/valid-compile": "warn",
                "svelte/no-unused-svelte-ignore": "warn"
            }
        }"#,
    )
    .unwrap()
}

/// Findings as `(ruleId, line, 1-based column)` — the oracle's own coordinates.
fn findings(src: &str) -> Vec<(String, u32, u32)> {
    let mut out: Vec<(String, u32, u32)> = lint_source(
        src,
        &PathBuf::from("test.svelte"),
        &CompileOptions::default(),
        &config(),
    )
    .into_iter()
    .filter_map(|d| {
        let r = d.range?;
        Some((d.code?, r.start.line, r.start.column + 1))
    })
    .collect();
    out.sort();
    out
}

const HTML: &str = "<script>\n\tlet x = \"\";\n</script>\n\n{@html x}\n";
const IMG: &str = "<img alt=\"photo of a cat\" src=\"a.png\" />\n";

fn html_with(directive: &str) -> String {
    format!("<script>\n\tlet x = \"\";\n</script>\n\n{directive}\n{{@html x}}\n")
}

fn img_with(directive: &str) -> String {
    format!("{directive}\n{IMG}")
}

#[test]
fn control_at_html_reports_when_nothing_suppresses_it() {
    assert_eq!(
        findings(HTML),
        vec![("svelte/no-at-html-tags".to_string(), 5, 1)]
    );
}

#[test]
fn control_compiler_warning_reports_when_nothing_suppresses_it() {
    assert_eq!(
        findings(IMG),
        vec![("svelte/valid-compile".to_string(), 1, 1)]
    );
}

/// eslint-disable-next-line × plugin rule id — the directive's own vocabulary.
#[test]
fn eslint_disable_suppresses_a_plugin_rule() {
    assert_eq!(
        findings(&html_with(
            "<!-- eslint-disable-next-line svelte/no-at-html-tags -->"
        )),
        vec![]
    );
}

/// svelte-ignore × compiler warning code — the directive's own vocabulary.
#[test]
fn svelte_ignore_suppresses_a_compiler_warning_code() {
    assert_eq!(
        findings(&img_with("<!-- svelte-ignore a11y_img_redundant_alt -->")),
        vec![]
    );
}

/// svelte-ignore × plugin rule id — the cell this file exists for. The oracle
/// leaves the rule reporting *and* reports the ignore as unused; both must hold
/// together, because suppressing while also calling the ignore unused is what
/// rsvelte did before.
#[test]
fn svelte_ignore_does_not_suppress_a_plugin_rule() {
    assert_eq!(
        findings(&html_with("<!-- svelte-ignore svelte/no-at-html-tags -->")),
        vec![
            ("svelte/no-at-html-tags".to_string(), 6, 1),
            ("svelte/no-unused-svelte-ignore".to_string(), 5, 20),
        ]
    );
}

/// eslint-disable-next-line × compiler warning code — measured against the
/// oracle rather than inferred from the three cells above.
#[test]
fn eslint_disable_does_not_suppress_a_compiler_warning_code() {
    assert_eq!(
        findings(&img_with(
            "<!-- eslint-disable-next-line a11y_img_redundant_alt -->"
        )),
        vec![("svelte/valid-compile".to_string(), 2, 1)]
    );
}
