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
        .rule("svelte/no-unused-svelte-ignore", Severity::Error, &[], &[])
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

// The oracle reports both: `compile` never returns a runtime warning.
#[test]
fn an_ignore_of_a_runtime_warning_is_unused() {
    let code = "<script>\n\tlet { a } = $props();\n\t// svelte-ignore ownership_invalid_mutation\n\
                \ta.b = 1;\n</script>\n<!-- svelte-ignore hydration_html_changed -->\n\
                {@html a}\n";
    assert_eq!(lint(code), [(3, 19), (6, 20)]);
}
