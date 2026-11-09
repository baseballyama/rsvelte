//! Runs one rule on a component, for the rules' own tests.

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineIndex;
use serde_json::value::RawValue;

/// What `rule` reports on `source` with `options` (a JSON array): each message with its 1-based
/// line and column, and the source with every fix applied.
pub(super) fn lint(rule: &str, options: &str, source: &str) -> (Vec<(String, u32, u32)>, String) {
    let mut registry = Registry::new();
    crate::register_artifacts(&mut registry);
    let document = Document::new("test.svelte".to_owned(), source.to_owned()).expect("small");
    let context = DocumentContext::new(&document, registry.artifacts());
    let options: Vec<Box<RawValue>> = serde_json::from_str(options).expect("a JSON array");
    let mut configuration = crate::Configuration::new(crate::LintSettings::default());
    configuration
        .rule(rule, Severity::Error, &options, &[])
        .expect("the rule and its options");
    let findings = crate::lint(&context, &configuration).expect("the source parses");
    let lines = LineIndex::new(source);
    let reports = findings
        .iter()
        .map(|finding| {
            let at = lines.line_column(finding.diagnostic.span.start_offset);
            (finding.diagnostic.message.clone(), at.line, at.column + 1)
        })
        .collect();
    (
        reports,
        rsvelte_lint_runner::finding::apply_fixes(source, &findings),
    )
}
