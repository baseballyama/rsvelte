use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Document, Registry};
use rsvelte_kernel::diagnostics::diagnostic::Severity;
use rsvelte_markup::button_type::Allowed;
use rsvelte_svelte_lint::{Configuration, RuleConfiguration};

fn configuration(rules: Vec<RuleConfiguration>) -> Configuration {
    Configuration::new(rules).expect("test rules are unique")
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
    let disabled = configuration(Vec::new());
    assert!(
        rsvelte_svelte_lint::lint(&context, &disabled)
            .expect("source parses")
            .is_empty()
    );
    assert_eq!(context.computed(), ["svelte.parse"]);
    let syntax = configuration(vec![RuleConfiguration::ButtonHasType {
        severity: Severity::Warning,
        allowed: Allowed::default(),
    }]);
    let findings = rsvelte_svelte_lint::lint(&context, &syntax).expect("source parses");
    assert_eq!(findings.len(), 1);
    assert!(matches!(findings[0].severity, Severity::Warning));
    assert_eq!(context.computed(), ["svelte.parse"]);
    let mixed = configuration(vec![
        RuleConfiguration::NoUnusedVariables(Severity::Error),
        syntax.rules()[0],
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
            "svelte.resolve",
            "svelte.compiler_syntax_tree",
            "svelte.lint.parents"
        ]
    );
}

#[test]
fn a_scope_rule_shares_resolution_and_does_not_request_js_parents() {
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register(&mut registry);
    let document = Document::new(
        "test.svelte".to_owned(),
        "{#each [1] as item ('same')}{item}{/each}".to_owned(),
    )
    .expect("valid input");
    let context = DocumentContext::new(&document, registry.artifacts());
    let rules = configuration(vec![RuleConfiguration::ValidEachKey(Severity::Error)]);
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
    let rule = RuleConfiguration::NoUnusedVariables(Severity::Error);
    assert_eq!(
        Configuration::new(vec![rule, rule]).err(),
        Some("each lint rule may be configured once")
    );
}

#[test]
fn scope_rules_distinguish_shadowed_bindings() {
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register(&mut registry);
    let rules = configuration(vec![RuleConfiguration::ValidEachKey(Severity::Error)]);
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

#[test]
fn normal_lint_does_not_register_type_services_or_typed_lint() {
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register(&mut registry);
    assert_eq!(registry.validate_plugins(), Ok(()));
    assert_eq!(registry.task_identifiers(), ["svelte.lint/default"]);
    assert_eq!(
        registry
            .plugins()
            .map(|plugin| plugin.identifier)
            .collect::<Vec<_>>(),
        ["svelte", "svelte.lint", "svelte.parser", "typescript"]
    );
}
