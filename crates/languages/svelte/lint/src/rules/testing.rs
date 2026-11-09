//! Runs one rule on a component, for the cases where this crate deliberately differs from
//! eslint-plugin-svelte and so cannot take the official tool's output as the expectation.

use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineIndex;
use rsvelte_lint_runner::finding::apply_fixes;
use serde_json::value::RawValue;

use crate::{Configuration, LintSettings};

/// What `rule` reports on `source_text`, as `line:column message`, and the code with its fixes
/// applied.
pub(super) fn lint(rule: &str, options: &str, source_text: &str) -> (Vec<String>, String) {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document =
        Document::new("test.svelte".to_owned(), source_text.to_owned()).expect("a small input");
    let options: Vec<Box<RawValue>> = serde_json::from_str(options).expect("options are JSON");
    let mut configuration = Configuration::new(LintSettings::default());
    configuration
        .rule(rule, Severity::Error, &options, &[])
        .expect("the options configure the rule");
    let context = DocumentContext::new(&document, registry.artifacts());
    let findings = crate::lint(&context, &configuration).expect("the input parses");
    let lines = LineIndex::new(source_text);
    let reports = findings
        .iter()
        .map(|f| {
            let at = lines.line_column(f.diagnostic.span.start_offset);
            format!("{}:{} {}", at.line, at.column + 1, f.diagnostic.message)
        })
        .collect();
    (reports, apply_fixes(source_text, &findings))
}
