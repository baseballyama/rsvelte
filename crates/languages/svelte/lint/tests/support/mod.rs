use std::collections::HashMap;
use std::path::Path;

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::pipeline::{Document, Registry, Task, TaskOutput};
use rsvelte_svelte_lint::computation::LintConfiguration;
use rsvelte_svelte_lint::{Configuration, RuleConfiguration};

pub(super) const ROOT: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/tests/rules");

pub(super) struct CaseConfiguration {
    pub(super) name: &'static str,
    pub(super) document: &'static str,
    pub(super) rules: &'static [RuleConfiguration],
    pub(super) strict: bool,
}

#[path = "../rules/cases.rs"]
mod cases;
pub(super) use cases::CASES;

pub(super) fn registry() -> Registry {
    let configurations: HashMap<_, _> = CASES
        .iter()
        .map(|case| {
            (
                case.document,
                std::sync::Arc::new(
                    Configuration::new(case.rules.to_vec()).expect("fixture has unique rules"),
                ),
            )
        })
        .collect();
    let mut registry = Registry::new();
    rsvelte_svelte_lint::register(&mut registry);
    registry.provide::<LintConfiguration>("fixtures", rsvelte_svelte::matches, move |context| {
        std::sync::Arc::clone(
            configurations
                .get(context.document.path.as_str())
                .expect("every rule fixture has a configuration"),
        )
    });
    registry
}

pub(super) fn verify_strict() {
    let registry = registry();
    let mut measured = 0;
    for case in CASES.iter().filter(|case| case.strict) {
        let directory = Path::new(ROOT).join(case.name);
        let source =
            std::fs::read_to_string(directory.join("input.svelte")).expect("fixture input exists");
        let document =
            Document::new(case.document.to_owned(), source).expect("fixture fits source limit");
        let context = DocumentContext::new(&document, registry.artifacts());
        let mut output = TaskOutput::default();
        rsvelte_svelte_lint::Lint.run(&context, &mut output);
        let expected = std::fs::read_to_string(directory.join("expected/findings.lint.json"))
            .expect("oracle snapshot exists");
        assert!(
            output.diagnostics.is_empty(),
            "{}: {:?}",
            case.name,
            output.diagnostics
        );
        assert_eq!(output.files.len(), 1, "{}: one lint report", case.name);
        assert_eq!(output.files[0].text, expected, "{}", case.name);
        measured += 1;
    }
    assert!(measured > 0, "conformance must measure a population");
}
