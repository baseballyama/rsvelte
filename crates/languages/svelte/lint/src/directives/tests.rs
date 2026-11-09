//! eslint-plugin-svelte's `tests/src/rules/comment-directive.ts`, case by case, and `ESLint`'s
//! own directives in `<script>`.
//!
//! Upstream lints with the core rules `no-undef` and `space-infix-ops` and the plugin's
//! `svelte/no-at-html-tags` and `svelte/no-at-debug-tags`. Stand-ins of the same names report
//! where those do on `{@html a+b}`: `svelte/no-at-html-tags` at the tag, `no-undef` at `a` and
//! `b`, `space-infix-ops` at `+`; `svelte/no-at-debug-tags` at a `{@debug}` tag; `no-undef` also
//! at a bare identifier statement in `<script>`.

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::{LineIndex, Span};
use rsvelte_lint_runner::rule::Reporter;
use rsvelte_svelte::syntax::syntax_tree::TemplateNode;
use serde_json::value::RawValue;

use crate::rule::{File, Files, SvelteRule};
use crate::{Configuration, LintSettings};

#[derive(Debug)]
struct StandIn(fn(&File<'_>) -> Vec<Span>);

impl SvelteRule for StandIn {
    fn check(&self, file: &File<'_>, reporter: &mut Reporter<'_>) {
        for span in (self.0)(file) {
            reporter.range("stand-in", span);
        }
    }
}

fn tags(file: &File<'_>, html: bool) -> Vec<Span> {
    file.component()
        .expect("a component")
        .nodes
        .iter()
        .filter_map(|node| match *node {
            TemplateNode::Html { span, .. } if html => Some(span),
            TemplateNode::Debug { span, .. } if !html => Some(span),
            _ => None,
        })
        .collect()
}

/// `a` and `b` of `{@html a+b}`, and `a` of a `<script>`'s `a;`.
fn undefined(file: &File<'_>) -> Vec<Span> {
    let source = file.source();
    let component = file.component().expect("a component");
    let mut out = Vec::new();
    for span in tags(file, true) {
        let expression = &span.text(source)["{@html ".len()..];
        let end = expression.find([' ', '}']).unwrap_or(expression.len());
        for (i, c) in expression[..end].char_indices() {
            if c == 'a' || c == 'b' {
                let at = span.start_offset + ("{@html ".len() + i) as u32;
                out.push(Span::new(at, at + 1));
            }
        }
    }
    if let Some(script) = &component.instance {
        let text = script.content.text(source);
        if let Some(i) = text.find("a;") {
            let at = script.content.start_offset + i as u32;
            out.push(Span::new(at, at + 1));
        }
    }
    out
}

fn infix(file: &File<'_>) -> Vec<Span> {
    let source = file.source();
    tags(file, true)
        .into_iter()
        .filter_map(|span| {
            let at = span.start_offset + span.text(source).find('+')? as u32;
            Some(Span::new(at, at + 1))
        })
        .collect()
}

type Find = fn(&File<'_>) -> Vec<Span>;

fn configuration(comment_directive: &str, settings: LintSettings) -> Configuration {
    let mut configuration = Configuration::new(settings);
    let rules: [(&'static str, Find); 4] = [
        ("no-undef", undefined),
        ("space-infix-ops", infix),
        ("svelte/no-at-html-tags", |f| tags(f, true)),
        ("svelte/no-at-debug-tags", |f| tags(f, false)),
    ];
    for (name, find) in rules {
        configuration
            .push(
                name,
                Files::Components,
                Severity::Error,
                Box::new(StandIn(find)),
            )
            .expect("unique");
    }
    let options: Vec<Box<RawValue>> = if comment_directive.is_empty() {
        Vec::new()
    } else {
        vec![RawValue::from_string(comment_directive.to_owned()).expect("JSON")]
    };
    configuration
        .rule("svelte/comment-directive", Severity::Error, &options, &[])
        .expect("configures");
    configuration
}

/// `(rule, line, 1-based column, message)` of each finding.
fn lint_with(code: &str, configuration: &Configuration) -> Vec<(String, u32, u32, String)> {
    let mut registry = Registry::new();
    crate::register_artifacts(&mut registry);
    let document = Document::new("test.svelte".to_owned(), code.to_owned()).expect("small");
    let context = DocumentContext::new(&document, registry.artifacts());
    let lines = LineIndex::new(code);
    crate::lint(&context, configuration)
        .expect("parses")
        .into_iter()
        .map(|f| {
            let at = lines.line_column(f.diagnostic.span.start_offset);
            (
                f.diagnostic.code.to_string(),
                at.line,
                at.column + 1,
                f.diagnostic.message,
            )
        })
        .collect()
}

fn lint(code: &str) -> Vec<(String, u32)> {
    lint_with(code, &configuration("", LintSettings::default()))
        .into_iter()
        .map(|(rule, line, ..)| (rule, line))
        .collect()
}

fn unused(code: &str) -> Vec<(String, u32, u32, String)> {
    lint_with(
        code,
        &configuration(
            r#"{"reportUnusedDisableDirectives":true}"#,
            LintSettings::default(),
        ),
    )
}

fn rules(found: &[(String, u32)]) -> Vec<&str> {
    found.iter().map(|(rule, _)| rule.as_str()).collect()
}

fn at(found: &[(String, u32)]) -> Vec<(&str, u32)> {
    found
        .iter()
        .map(|(rule, line)| (rule.as_str(), *line))
        .collect()
}

const HTML: &str = "svelte/no-at-html-tags";
const UNDEF: &str = "no-undef";
const INFIX: &str = "space-infix-ops";
const DEBUG: &str = "svelte/no-at-debug-tags";
const DIRECTIVE: &str = "svelte/comment-directive";

#[test]
fn disable_all_rules() {
    assert_eq!(
        lint("\n      <!-- eslint-disable -->\n      {@html a+b}\n      "),
        []
    );
}

#[test]
fn disable_specific_rules() {
    let found = lint("\n      <!-- eslint-disable space-infix-ops -->\n      {@html a+b}\n      ");
    assert_eq!(rules(&found), [HTML, UNDEF, UNDEF]);
}

#[test]
fn enable_all_rules() {
    let found = lint(
        "\n      <!-- eslint-disable -->\n      {@html a+b}\n      <!-- eslint-enable -->\n      {@html a+b}\n       ",
    );
    assert_eq!(at(&found), [(HTML, 5), (UNDEF, 5), (INFIX, 5), (UNDEF, 5)]);
}

#[test]
fn enable_specific_rules() {
    let found = lint(
        "\n      <!-- eslint-disable svelte/no-at-html-tags, space-infix-ops -->\n      {@html a+b}\n      <!-- eslint-enable space-infix-ops -->\n      {@html a+b}\n      ",
    );
    assert_eq!(
        at(&found),
        [(UNDEF, 3), (UNDEF, 3), (UNDEF, 5), (INFIX, 5), (UNDEF, 5)]
    );
}

#[test]
fn does_not_affect_the_code_in_script() {
    let found = lint(
        "\n      <!-- eslint-disable -->\n      {@html a+b}\n      <script>\n        a;\n      </script>\n      ",
    );
    assert_eq!(rules(&found), [UNDEF]);
}

#[test]
fn disable_specific_rules_with_empty_entries() {
    let found = lint(
        "\n      <!-- eslint-disable space-infix-ops ,, , svelte/no-at-html-tags -->\n      {@html a+b}\n      ",
    );
    assert_eq!(rules(&found), [UNDEF, UNDEF]);
}

#[test]
fn disable_line_all_rules() {
    assert_eq!(
        lint("\n      {@html a+b} <!-- eslint-disable-line -->\n      "),
        []
    );
}

#[test]
fn disable_line_specific_rules() {
    let found = lint("\n      {@html a+b} <!-- eslint-disable-line space-infix-ops -->\n      ");
    assert_eq!(rules(&found), [HTML, UNDEF, UNDEF]);
}

#[test]
fn disable_line_on_another_line() {
    let found = lint(
        "\n      <!-- eslint-disable-line -->\n      {@html a+b}\n      <!-- eslint-disable-line -->\n      ",
    );
    assert_eq!(rules(&found), [HTML, UNDEF, INFIX, UNDEF]);
}

#[test]
fn disable_next_line_all_rules() {
    assert_eq!(
        lint("\n      <!-- eslint-disable-next-line -->\n      {@html a+b}\n      "),
        []
    );
}

#[test]
fn disable_next_line_specific_rules() {
    let found = lint(
        "\n      <!-- eslint-disable-next-line space-infix-ops -->\n      {@html a+b}\n      ",
    );
    assert_eq!(rules(&found), [HTML, UNDEF, UNDEF]);
}

#[test]
fn disable_next_line_on_another_line() {
    let found = lint(
        "\n      <!-- eslint-disable-next-line -->\n\n      {@html a+b} <!-- eslint-disable-next-line -->\n      <!-- eslint-disable-next-line -->\n      ",
    );
    assert_eq!(at(&found), [(HTML, 4), (UNDEF, 4), (INFIX, 4), (UNDEF, 4)]);
}

#[test]
fn disable_next_line_affects_only_the_next_line() {
    let found = lint(
        "\n      <!-- eslint-disable-next-line svelte/no-at-html-tags, space-infix-ops -->\n      {@html a+b}\n      {@html a+b}\n      ",
    );
    assert_eq!(
        at(&found),
        [
            (UNDEF, 3),
            (UNDEF, 3),
            (HTML, 4),
            (UNDEF, 4),
            (INFIX, 4),
            (UNDEF, 4)
        ]
    );
}

#[test]
fn description_disable_all() {
    assert_eq!(
        lint("\n      <!-- eslint-disable -- description -->\n      {@html a+b}\n      "),
        []
    );
}

#[test]
fn description_enable_all() {
    let found = lint(
        "\n      <!-- eslint-disable -- description -->\n      {@html a+b}\n      <!-- eslint-enable -- description -->\n      {@html a+b}\n      ",
    );
    assert_eq!(at(&found), [(HTML, 5), (UNDEF, 5), (INFIX, 5), (UNDEF, 5)]);
}

#[test]
fn description_enable_specific_rules() {
    let found = lint(
        "\n      <!-- eslint-disable svelte/no-at-html-tags, space-infix-ops -- description -->\n      {@html a+b}\n      <!-- eslint-enable space-infix-ops -- description -->\n      {@html a+b}\n      ",
    );
    assert_eq!(
        at(&found),
        [(UNDEF, 3), (UNDEF, 3), (UNDEF, 5), (INFIX, 5), (UNDEF, 5)]
    );
}

#[test]
fn description_disable_line_all() {
    assert_eq!(
        lint("\n      {@html a+b} <!-- eslint-disable-line -- description -->\n      "),
        []
    );
}

#[test]
fn description_disable_line_specific_rules() {
    let found = lint(
        "\n      {@html a+b} <!-- eslint-disable-line space-infix-ops -- description -->\n      ",
    );
    assert_eq!(rules(&found), [HTML, UNDEF, UNDEF]);
}

#[test]
fn description_disable_next_line_all() {
    assert_eq!(
        lint("\n      <!-- eslint-disable-next-line -- description -->\n      {@html a+b}\n      "),
        []
    );
}

#[test]
fn description_disable_next_line_specific_rules() {
    let found = lint(
        "\n      <!-- eslint-disable-next-line space-infix-ops -- description -->\n      {@html a+b}\n      ",
    );
    assert_eq!(rules(&found), [HTML, UNDEF, UNDEF]);
}

fn message(found: &[(String, u32, u32, String)]) -> Vec<(&str, u32, u32, &str)> {
    found
        .iter()
        .map(|(rule, line, column, message)| (rule.as_str(), *line, *column, message.as_str()))
        .collect()
}

#[test]
fn report_unused_disable() {
    let found = unused("\n        <!-- eslint-disable -->\n        <div>Hello</div>\n      ");
    assert_eq!(
        message(&found),
        [(
            DIRECTIVE,
            2,
            9,
            "Unused eslint-disable directive (no problems were reported)."
        )]
    );
}

#[test]
fn do_not_report_a_used_disable() {
    let found = unused(
        "\n        <!-- eslint-disable -->\n        <div>{@html foo}{@debug foo}</div>\n      ",
    );
    assert_eq!(found, []);
}

#[test]
fn disable_and_report_an_unused_disable() {
    let found = unused(
        "\n        <!-- eslint-disable -->\n        <div>{@html foo}{@debug foo}</div>\n        <!-- eslint-enable -->\n        <!-- eslint-disable -->\n        <div>Hello</div>\n      ",
    );
    assert_eq!(
        message(&found),
        [(
            DIRECTIVE,
            5,
            9,
            "Unused eslint-disable directive (no problems were reported)."
        )]
    );
}

#[test]
fn report_unused_disable_of_rules() {
    let found = unused(
        "\n        <!-- eslint-disable svelte/no-at-debug-tags, svelte/no-at-html-tags -->\n        <div>Hello</div>\n      ",
    );
    assert_eq!(
        message(&found),
        [
            (
                DIRECTIVE,
                2,
                29,
                "Unused eslint-disable directive (no problems were reported from 'svelte/no-at-debug-tags')."
            ),
            (
                DIRECTIVE,
                2,
                54,
                "Unused eslint-disable directive (no problems were reported from 'svelte/no-at-html-tags')."
            )
        ]
    );
}

#[test]
fn report_unused_disable_next_line_of_rules() {
    let found = unused(
        "\n        <!-- eslint-disable-next-line svelte/no-at-debug-tags, svelte/no-at-html-tags -->\n        <div>Hello</div>\n        <div>{@html foo}{@debug foo}</div>\n      ",
    );
    let found = message(&found);
    assert_eq!(
        found[..2],
        [
            (
                DIRECTIVE,
                2,
                39,
                "Unused eslint-disable-next-line directive (no problems were reported from 'svelte/no-at-debug-tags')."
            ),
            (
                DIRECTIVE,
                2,
                64,
                "Unused eslint-disable-next-line directive (no problems were reported from 'svelte/no-at-html-tags')."
            )
        ]
    );
    let rest: Vec<(&str, u32)> = found[2..].iter().map(|f| (f.0, f.1)).collect();
    assert_eq!(rest, [(HTML, 4), (DEBUG, 4)]);
}

#[test]
fn do_not_report_a_used_disable_next_line() {
    let found = unused(
        "\n        <!-- eslint-disable-next-line svelte/no-at-debug-tags, svelte/no-at-html-tags -->\n        <div>{@html foo}{@debug foo}</div>\n      ",
    );
    assert_eq!(found, []);
}

#[test]
fn do_not_report_used_with_a_duplicate_disable() {
    let found = unused(
        "\n        <!-- eslint-disable -->\n        <!-- eslint-disable-next-line svelte/no-at-debug-tags, svelte/no-at-html-tags -->\n        <div>{@html foo}</div><!-- eslint-disable-line svelte/no-at-debug-tags, svelte/no-at-html-tags -->\n      ",
    );
    assert_eq!(found, []);
}

#[test]
fn report_unused_enable() {
    let found = unused("\n        <!-- eslint-enable -->\n      ");
    assert_eq!(
        message(&found),
        [(
            DIRECTIVE,
            2,
            9,
            "Unused eslint-enable directive (reporting is not suppressed)."
        )]
    );
}

#[test]
fn report_unused_enable_of_a_rule() {
    let found = unused(
        "\n        <!-- eslint-disable svelte/no-at-html-tags -->\n        <div>{@html foo}</div>\n        <!-- eslint-enable svelte/no-at-debug-tags -->\n      ",
    );
    assert_eq!(
        message(&found),
        [(
            DIRECTIVE,
            4,
            28,
            "Unused eslint-enable directive (reporting from 'svelte/no-at-debug-tags' is not suppressed)."
        )]
    );
}

#[test]
fn javascript_block_directives_reach_the_template() {
    let found = lint("<script>\n/* eslint-disable no-undef */\n</script>\n{@html a+b}\n");
    assert_eq!(rules(&found), [HTML, INFIX]);
    let found = lint(
        "<script>\n/* eslint-disable */\n/* eslint-enable 'space-infix-ops' */\n</script>\n{@html a+b}\n",
    );
    assert_eq!(rules(&found), [INFIX]);
}

#[test]
fn javascript_line_comments_hold_only_line_directives() {
    let found = lint("<script>\n// eslint-disable\n</script>\n{@html a+b}\n");
    assert_eq!(rules(&found), [HTML, UNDEF, INFIX, UNDEF]);
    let found = lint("{@html a+b /* eslint-disable-line no-undef -- why */}\n{@html a+b}\n");
    assert_eq!(
        at(&found),
        [
            (HTML, 1),
            (INFIX, 1),
            (HTML, 2),
            (UNDEF, 2),
            (INFIX, 2),
            (UNDEF, 2)
        ]
    );
    let found = lint("<script>\n// eslint-disable-next-line\na;\n</script>\n");
    assert_eq!(found, []);
}

#[test]
fn system_turns_ignored_rules_off_outside_script() {
    for (ignored, kept) in [
        (UNDEF, &[(HTML, 1), (INFIX, 1), (UNDEF, 3)][..]),
        ("/^(no|space)-/u", &[(HTML, 1), (UNDEF, 3)]),
    ] {
        let mut settings = LintSettings::default();
        settings.ignore_warnings = vec![ignored.to_owned()];
        let mut configuration = configuration("", settings);
        configuration
            .rule("svelte/system", Severity::Error, &[], &[])
            .expect("configures");
        let found = lint_with(
            "{@html a+b}\n<script>\n  a;\n</script>\n<script module>\n  a;\n</script>\n",
            &configuration,
        );
        let found: Vec<(&str, u32)> = found.iter().map(|f| (f.0.as_str(), f.1)).collect();
        assert_eq!(found, kept, "{ignored}");
    }
}

#[test]
fn system_rejects_an_invalid_pattern() {
    let mut settings = LintSettings::default();
    settings.ignore_warnings = vec!["/(/".to_owned()];
    let mut configuration = Configuration::new(settings);
    let error = configuration
        .rule("svelte/system", Severity::Error, &[], &[])
        .expect_err("rejects");
    assert!(error.contains("invalid regular expression"), "{error}");
}

#[test]
fn rule_names_separated_by_wide_spaces() {
    let found =
        lint("<!-- eslint-disable no-undef\u{3000}space-infix-ops\u{a0}x -->\n{@html a+b}\n");
    assert_eq!(rules(&found), [HTML]);
}
