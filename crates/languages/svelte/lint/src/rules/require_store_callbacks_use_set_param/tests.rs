use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;
use rsvelte_kernel::source::positions::LineIndex;

use crate::{Configuration, LintSettings};

/// Each finding's line and 1-based column.
fn lint(code: &str) -> Vec<(u32, u32)> {
    let mut registry = Registry::new();
    crate::register_artifacts(&mut registry);
    let mut configuration = Configuration::new(LintSettings::default());
    configuration
        .rule(
            "svelte/require-store-callbacks-use-set-param",
            Severity::Error,
            &[],
            &[],
        )
        .expect("configures");
    let document = Document::new("test.svelte".to_owned(), code.to_owned()).expect("small");
    let context = DocumentContext::new(&document, registry.artifacts());
    let lines = LineIndex::new(code);
    crate::lint(&context, &configuration)
        .expect("parses")
        .into_iter()
        .map(|f| {
            let at = lines.line_column(f.diagnostic.span.start_offset);
            (at.line, at.column + 1)
        })
        .collect()
}

// The oracle reports the first two: ESTree's first parameter is `this`.
#[test]
fn a_this_parameter_comes_first() {
    let code = "<script lang=\"ts\">\n\timport { writable } from 'svelte/store';\n\
                \twritable(0, function (this: Window, set: () => void) { set(); });\n\
                \twritable(0, function (this: Window) {});\n\
                \twritable(0, function (set: () => void) { set(); });\n</script>\n";
    assert_eq!(lint(code), [(3, 14), (4, 14)]);
}
