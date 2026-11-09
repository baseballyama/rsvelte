use rsvelte_kernel::computation::database::DocumentContext;
use rsvelte_kernel::computation::registry::Registry;
use rsvelte_kernel::diagnostics::Severity;
use rsvelte_kernel::source::document::Document;

/// The lines `svelte/indent` reports, 1-based.
fn reported_lines(source_text: &str) -> Vec<u32> {
    let mut registry = Registry::new();
    crate::register(&mut registry);
    let document =
        Document::new("test.svelte".to_owned(), source_text.to_owned()).expect("valid source");
    let context = DocumentContext::new(&document, registry.artifacts());
    let mut configuration = crate::Configuration::new(crate::LintSettings::default());
    configuration
        .rule("svelte/indent", Severity::Error, &[], &[])
        .expect("a known rule");
    let lines = context.line_index();
    crate::lint(&context, &configuration)
        .expect("source parses")
        .iter()
        .map(|f| lines.line_column(f.diagnostic.span.start_offset).line)
        .collect()
}

#[test]
fn type_syntax_the_tree_does_not_hold_is_not_checked() {
    // Line 4 is a type, which the parameter list would otherwise place; line 6 is JavaScript.
    let typescript = "<script lang=\"ts\">\n  function f(\n    b:\n        number\n  ) {}\nlet c = 1;\n</script>\n";
    assert_eq!(reported_lines(typescript), [6]);
    // The same shape in JavaScript is checked.
    let javascript = typescript.replace(" lang=\"ts\"", "").replace("b:", "b =");
    assert_eq!(reported_lines(&javascript), [4, 6]);
}

#[test]
fn a_shorthand_property_with_a_default_is_a_pattern() {
    let source = "<script>\n  ({\n  a = 1\n  } = v);\n</script>\n";
    assert_eq!(reported_lines(source), [3]);
}
