use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;
use rsvelte_svelte_lint::types::{ConditionType, TypeFacts};
use rsvelte_svelte_lint::{Configuration, LintSettings};

fn configuration(rules: &[(&str, Severity)]) -> Configuration {
    let mut configuration = Configuration::new(LintSettings::default());
    for (name, severity) in rules {
        configuration
            .rule(name, *severity, &[], &[])
            .expect("test rules are unique and known");
    }
    configuration
}

#[test]
fn disabled_and_syntax_rules_do_not_build_semantic_facts() {
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register(&mut registry);
    let document = Document::new(
        "test.svelte".to_owned(),
        "<script>const x = 1;</script><button/>".to_owned(),
    )
    .expect("valid input");
    let context = DocumentContext::new(&document, registry.artifacts());
    let disabled = configuration(&[]);
    assert!(
        rsvelte_svelte_lint::lint(&context, &disabled)
            .expect("source parses")
            .is_empty()
    );
    assert_eq!(context.computed(), ["svelte.parse"]);
    let syntax = configuration(&[("svelte/button-has-type", Severity::Warning)]);
    let findings = rsvelte_svelte_lint::lint(&context, &syntax).expect("source parses");
    assert_eq!(findings.len(), 1);
    assert!(matches!(findings[0].diagnostic.severity, Severity::Warning));
    assert_eq!(context.computed(), ["svelte.parse"]);
    let mixed = configuration(&[
        ("no-unused-vars", Severity::Error),
        ("svelte/button-has-type", Severity::Warning),
    ]);
    assert_eq!(
        rsvelte_svelte_lint::lint(&context, &mixed)
            .expect("source parses")
            .len(),
        2
    );
    assert_eq!(
        context.computed(),
        [
            "svelte.parse",
            "svelte.compiler_syntax_tree",
            "svelte.resolve"
        ]
    );
}

#[test]
fn a_scope_rule_shares_resolution_and_does_not_request_javascript_parents() {
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register(&mut registry);
    let document = Document::new(
        "test.svelte".to_owned(),
        "{#each [1] as item ('same')}{item}{/each}".to_owned(),
    )
    .expect("valid input");
    let context = DocumentContext::new(&document, registry.artifacts());
    let rules = configuration(&[("svelte/valid-each-key", Severity::Error)]);
    for _ in 0..2 {
        assert_eq!(
            rsvelte_svelte_lint::lint(&context, &rules)
                .expect("source parses")
                .len(),
            1
        );
    }
    assert_eq!(
        context.computed(),
        [
            "svelte.parse",
            "svelte.compiler_syntax_tree",
            "svelte.resolve"
        ]
    );
}

#[test]
fn duplicate_rules_are_rejected_before_execution() {
    let mut configuration = configuration(&[("no-unused-vars", Severity::Error)]);
    assert_eq!(
        configuration
            .rule("no-unused-vars", Severity::Warning, &[], &[])
            .err(),
        Some("rule `no-unused-vars` is configured twice".to_owned())
    );
    assert_eq!(
        configuration
            .rule("svelte/no-such-rule", Severity::Error, &[], &[])
            .err(),
        Some("unknown Svelte lint rule `svelte/no-such-rule`".to_owned())
    );
}

#[test]
fn scope_rules_distinguish_shadowed_bindings() {
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register(&mut registry);
    let rules = configuration(&[("svelte/valid-each-key", Severity::Error)]);
    for (key, expected) in [("item", 0), ("((item) => item)(0)", 1)] {
        let document = Document::new(
            "test.svelte".to_owned(),
            format!("{{#each [1] as item ({key})}}{{item}}{{/each}}"),
        )
        .expect("valid input");
        let context = DocumentContext::new(&document, registry.artifacts());
        assert_eq!(
            rsvelte_svelte_lint::lint(&context, &rules)
                .expect("source parses")
                .len(),
            expected,
            "{key}"
        );
    }
}

const TYPED: &str = "svelte/@typescript-eslint/no-unnecessary-condition";

#[test]
fn a_type_provider_is_lazy_cached_and_replaces_the_built_in_types() {
    let calls = Arc::new(AtomicUsize::new(0));
    let provider_calls = Arc::clone(&calls);
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register_artifacts(&mut registry);
    rsvelte_svelte_lint::register_type_provider(&mut registry, move |context| {
        provider_calls.fetch_add(1, Ordering::Relaxed);
        let resolution = context
            .get::<rsvelte_svelte_semantic::Resolved>()
            .as_ref()
            .expect("source parses");
        TypeFacts::new(vec![
            ConditionType::Truthy;
            resolution.semantic().nodes().len()
        ])
    });
    let document = Document::new(
        "test.svelte".to_owned(),
        "<script lang=\"ts\">if (external) console.log(external);</script>".to_owned(),
    )
    .expect("valid input");
    let context = DocumentContext::new(&document, registry.artifacts());
    rsvelte_svelte_lint::lint(&context, &configuration(&[])).expect("source parses");
    assert_eq!(calls.load(Ordering::Relaxed), 0);
    let typed = configuration(&[(TYPED, Severity::Error)]);
    for _ in 0..2 {
        assert_eq!(
            rsvelte_svelte_lint::lint(&context, &typed)
                .expect("source parses")
                .len(),
            1
        );
    }
    assert_eq!(calls.load(Ordering::Relaxed), 1);
    assert_eq!(
        context.computed(),
        [
            "svelte.parse",
            "svelte.lint.condition_types",
            "svelte.resolve",
            "svelte.compiler_syntax_tree"
        ]
    );
    assert_eq!(
        context
            .accesses()
            .iter()
            .filter(|access| access.name == "svelte.lint.condition_types" && !access.cached)
            .count(),
        1
    );
}

#[test]
fn type_facts_that_do_not_fit_the_component_fail_the_document() {
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register_artifacts(&mut registry);
    rsvelte_svelte_lint::register_type_provider(&mut registry, |_| TypeFacts::new(Vec::new()));
    let document = Document::new(
        "test.svelte".to_owned(),
        "<script>if (true) console.log(1);</script><button/>".to_owned(),
    )
    .expect("valid input");
    let context = DocumentContext::new(&document, registry.artifacts());
    let typed = configuration(&[
        ("svelte/button-has-type", Severity::Error),
        (TYPED, Severity::Error),
    ]);
    let failure = rsvelte_svelte_lint::lint(&context, &typed).expect_err("the facts do not fit");
    assert_eq!(failure.code, "rule_failed");
    assert!(
        failure
            .message
            .ends_with("the type provider gave 0 condition types for 9 JavaScript nodes"),
        "{}",
        failure.message
    );
}

#[test]
fn a_type_aware_report_covers_the_assertion_around_its_node() {
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register(&mut registry);
    let source = "<script lang=\"ts\">if (true as true) console.log(1);</script>";
    let document = Document::new("test.svelte".to_owned(), source.to_owned()).expect("valid");
    let context = DocumentContext::new(&document, registry.artifacts());
    let findings = rsvelte_svelte_lint::lint(&context, &configuration(&[(TYPED, Severity::Error)]))
        .expect("source parses");
    let spans: Vec<_> = findings
        .iter()
        .map(|f| {
            &source[f.diagnostic.span.start_offset as usize..f.diagnostic.span.end_offset as usize]
        })
        .collect();
    assert_eq!(spans, ["true as true"]);
}

#[test]
fn without_a_type_provider_the_built_in_types_are_computed_once_on_request() {
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register(&mut registry);
    let document = Document::new(
        "test.svelte".to_owned(),
        "<script>if (true) console.log(1);</script><button/>".to_owned(),
    )
    .expect("valid input");
    let context = DocumentContext::new(&document, registry.artifacts());
    let syntax = configuration(&[("svelte/button-has-type", Severity::Error)]);
    rsvelte_svelte_lint::lint(&context, &syntax).expect("source parses");
    assert_eq!(context.computed(), ["svelte.parse"]);
    let typed = configuration(&[
        ("svelte/button-has-type", Severity::Error),
        (TYPED, Severity::Warning),
    ]);
    for _ in 0..2 {
        let findings = rsvelte_svelte_lint::lint(&context, &typed).expect("source parses");
        assert_eq!(findings.len(), 2);
        assert_eq!(
            findings[0].diagnostic.message,
            "Unnecessary conditional, value is always truthy."
        );
        assert!(matches!(findings[0].diagnostic.severity, Severity::Warning));
    }
    assert_eq!(
        context.computed(),
        [
            "svelte.parse",
            "svelte.lint.native_condition_types",
            "svelte.resolve",
            "svelte.compiler_syntax_tree"
        ]
    );
}

#[test]
fn lint_does_not_register_type_services() {
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register(&mut registry);
    assert_eq!(registry.validate_plugins(), Ok(()));
    assert_eq!(registry.task_identifiers(), ["svelte.lint/default"]);
    assert_eq!(
        registry
            .plugins()
            .map(|plugin| plugin.identifier)
            .collect::<Vec<_>>(),
        [
            "svelte.lint",
            "svelte.semantic",
            "svelte.syntax",
            "typescript.semantic",
            "typescript.syntax",
            "typescript.tree"
        ]
    );
}

/// The markup layout rules read the surface tree and its tokens only, even on a component where
/// each of them reports.
#[test]
fn markup_layout_rules_request_only_the_surface_tree() {
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register(&mut registry);
    let document = Document::new(
        "test.svelte".to_owned(),
        "<script lang='ts'>\nconst x = 1; \n</script>\n<div b a = \"1\"\n  c={ x }  ></div>\n\
         <!--c-->\n<br>\n"
            .to_owned(),
    )
    .expect("valid input");
    let context = DocumentContext::new(&document, registry.artifacts());
    let rules = [
        "svelte/first-attribute-linebreak",
        "svelte/html-closing-bracket-new-line",
        "svelte/html-closing-bracket-spacing",
        "svelte/html-quotes",
        "svelte/html-self-closing",
        "svelte/max-attributes-per-line",
        "svelte/mustache-spacing",
        "svelte/no-spaces-around-equal-signs-in-attribute",
        "svelte/no-trailing-spaces",
        "svelte/sort-attributes",
        "svelte/spaced-html-comment",
    ];
    let configured: Vec<_> = rules.iter().map(|rule| (*rule, Severity::Error)).collect();
    let findings =
        rsvelte_svelte_lint::lint(&context, &configuration(&configured)).expect("source parses");
    assert_eq!(context.computed(), ["svelte.parse"]);
    for rule in rules {
        assert!(
            findings.iter().any(|f| f.diagnostic.code == rule),
            "{rule} reports"
        );
    }
}

#[test]
fn style_rules_share_inline_styles_and_the_style_verdict_without_scopes() {
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register(&mut registry);
    let document = Document::new(
        "test.svelte".to_owned(),
        "<div class=\"a {b ? 'c' : ''}\" style=\"color: red; color: blue\" style:colour=\"x\"></div>\
         <style>.a { margin: 0 } div {}</style>"
            .to_owned(),
    )
    .expect("valid input");
    let context = DocumentContext::new(&document, registry.artifacts());
    let rules = configuration(
        &[
            "svelte/consistent-selector-style",
            "svelte/no-dupe-style-properties",
            "svelte/no-inline-styles",
            "svelte/no-shorthand-style-property-overrides",
            "svelte/no-unknown-style-directive-property",
            "svelte/no-unused-class-name",
            "svelte/prefer-class-directive",
            "svelte/prefer-style-directive",
            "svelte/require-optimized-style-attribute",
            "svelte/valid-style-parse",
        ]
        .map(|name| (name, Severity::Error)),
    );
    assert!(
        !rsvelte_svelte_lint::lint(&context, &rules)
            .expect("source parses")
            .is_empty()
    );
    assert_eq!(
        context.computed(),
        [
            "svelte.parse",
            "svelte.lint.style_sheet_verdict",
            "svelte.lint.inline_styles"
        ]
    );
}
