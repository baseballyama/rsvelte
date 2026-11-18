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
        .rule("svelte/no-dom-manipulating", Severity::Error, &[], &[])
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

// The oracle reports the first two: a key's name is evaluated without a scope.
#[test]
fn a_computed_key_is_evaluated_without_names() {
    let code = "<script>\n\tlet el;\n\tfunction go() {\n\t\tel['rem' + 'ove']();\n\
                \t\tel[`inner${'HTML'}`] = '';\n\t\tel[String('remove')]();\n\t}\n</script>\n\
                <div bind:this={el}>a</div>\n<button type=\"button\" onclick={go}>x</button>\n";
    assert_eq!(lint(code), [(4, 3), (5, 3)]);
}
