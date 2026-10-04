use std::sync::Arc;
use std::sync::atomic::{AtomicUsize, Ordering};

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task};
use rsvelte_kernel::diagnostics::diagnostic::Severity;
use rsvelte_markup::button_type::Allowed;
use rsvelte_svelte_lint_typed::Configuration;
use rsvelte_svelte_lint_typed::computation::ConditionTypes;
use rsvelte_svelte_lint_typed::types::{ConditionType, TypeFacts};

#[test]
fn type_providers_are_lazy_cached_and_replaceable() {
    let calls = Arc::new(AtomicUsize::new(0));
    let provider_calls = Arc::clone(&calls);
    let mut registry = Registry::new();
    rsvelte_svelte_lint_typed::register_with_type_provider(&mut registry, move |context| {
        provider_calls.fetch_add(1, Ordering::Relaxed);
        let component = context
            .get::<rsvelte_svelte::Parsed>()
            .as_ref()
            .expect("source parses");
        TypeFacts::new(vec![ConditionType::Truthy; component.javascript.len()])
    });
    let document = Document::new(
        "test.svelte".to_owned(),
        "<script lang=\"ts\">if (external) console.log(external);</script>".to_owned(),
    )
    .expect("valid input");
    let context = DocumentContext::new(&document, registry.artifacts());
    rsvelte_svelte_lint_typed::lint(
        &context,
        &Configuration {
            no_unnecessary_condition: None,
        },
    )
    .expect("source parses");
    assert_eq!(calls.load(Ordering::Relaxed), 0);
    let rules = Configuration::default();
    for _ in 0..2 {
        assert_eq!(
            rsvelte_svelte_lint_typed::lint(&context, &rules)
                .expect("source parses")
                .len(),
            1
        );
    }
    assert_eq!(calls.load(Ordering::Relaxed), 1);
    assert_eq!(
        context.computed(),
        ["svelte.parse", "svelte.lint.typed.condition_types"]
    );
    assert_eq!(
        context
            .accesses()
            .iter()
            .filter(|access| access.name
                == <ConditionTypes as rsvelte_kernel::computation::database::Facet>::NAME
                && !access.cached)
            .count(),
        1
    );
}

#[test]
fn a_missing_type_provider_reports_the_requirement() {
    let mut registry = Registry::new();
    rsvelte_svelte::register(&mut registry);
    let document = Document::new(
        "test.svelte".to_owned(),
        "<script>if (true) console.log(1);</script>".to_owned(),
    )
    .expect("valid input");
    let context = DocumentContext::new(&document, registry.artifacts());
    let rules = Configuration::default();
    let findings = rsvelte_svelte_lint_typed::lint(&context, &rules).expect("source parses");
    assert_eq!(findings.len(), 1);
    assert_eq!(
        findings[0].message,
        "This rule requires a condition type provider."
    );
    assert_eq!(context.computed(), ["svelte.parse"]);
}

#[test]
fn typed_lint_registers_dependencies_without_enabling_their_tasks() {
    let mut registry = Registry::new();
    rsvelte_svelte_lint_typed::register(&mut registry);
    assert_eq!(registry.validate_plugins(), Ok(()));
    assert_eq!(registry.task_identifiers(), ["svelte.lint.typed/default"]);
    assert_eq!(
        registry
            .plugins()
            .map(|plugin| plugin.identifier)
            .collect::<Vec<_>>(),
        [
            "svelte",
            "svelte.lint",
            "svelte.lint.typed",
            "svelte.parser",
            "typescript",
            "typescript.check"
        ]
    );
}

#[test]
fn normal_and_typed_lint_share_parsing_and_keep_separate_configurations() {
    use rsvelte_kernel::computation::pipeline::{RunOptions, Sharing, run};
    use rsvelte_svelte_lint::RuleConfiguration;
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register_with_configuration(
        &mut registry,
        rsvelte_svelte_lint::Configuration::new(vec![RuleConfiguration::ButtonHasType {
            severity: Severity::Error,
            allowed: Allowed::default(),
        }])
        .expect("unique rules"),
    );
    rsvelte_svelte_lint_typed::register_with_configuration(
        &mut registry,
        Configuration {
            no_unnecessary_condition: Some(Severity::Warning),
        },
    );
    let document = registry
        .document(
            "test.svelte",
            "<script>if (true) console.log(1);</script><button/>",
        )
        .expect("valid source");
    let context = DocumentContext::new(&document, registry.artifacts());
    let mut normal = rsvelte_kernel::computation::pipeline::TaskOutput::default();
    let mut typed = rsvelte_kernel::computation::pipeline::TaskOutput::default();
    rsvelte_svelte_lint::Lint.run(&context, &mut normal);
    assert_eq!(
        context.computed(),
        ["svelte.lint.configuration", "svelte.parse"]
    );
    rsvelte_svelte_lint_typed::Lint.run(&context, &mut typed);
    assert!(normal.files[0].text.contains("svelte/button-has-type"));
    assert!(typed.files[0].text.contains("always truthy"));
    assert_eq!(
        context
            .computed()
            .iter()
            .filter(|&&name| name == "svelte.parse")
            .count(),
        1
    );
    let findings = rsvelte_svelte_lint_typed::lint(
        &context,
        &Configuration {
            no_unnecessary_condition: Some(Severity::Warning),
        },
    )
    .expect("source parses");
    assert!(matches!(findings[0].severity, Severity::Warning));
    let results = run(
        &registry,
        std::slice::from_ref(&document),
        &RunOptions {
            tasks: &[],
            sharing: Sharing::Shared,
            threads: Some(1),
        },
    )
    .expect("valid plugins and tasks");
    assert!(results[0].panic.is_none());
    assert_eq!(results[0].outputs.len(), 2);
}
