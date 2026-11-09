use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::computation::task::{Task, TaskOutput};
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;

use super::{Lint, register_with_configuration};
use crate::{Configuration, LintSettings};

/// `ESLint` ends a line at a lone CR and at U+2028, so the trailing space after `b` is on line 3.
#[test]
fn positions_count_ecmascript_lines() {
    let mut configuration = Configuration::new(LintSettings::default());
    configuration
        .rule("svelte/no-trailing-spaces", Severity::Error, &[], &[])
        .expect("a built-in rule");
    let mut registry = Registry::new();
    register_with_configuration(&mut registry, configuration);
    let document = Document::new("App.svelte".to_owned(), "<p>\ra\u{2028}b \n</p>".to_owned())
        .expect("a small document");
    let context = DocumentContext::new(&document, registry.artifacts());
    let mut out = TaskOutput::default();
    Lint { modules: false }.run(&context, &mut out);
    let json: serde_json::Value =
        serde_json::from_str(&out.files[0].text).expect("the report is JSON");
    let start = &json["findings"][0]["start"];
    assert_eq!(
        (start["line"].as_u64(), start["column"].as_u64()),
        (Some(3), Some(2))
    );
}
